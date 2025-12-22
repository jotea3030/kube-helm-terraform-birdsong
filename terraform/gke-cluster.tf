# terraform/gke-cluster.tf
# Cost-optimized GKE cluster for Wiz interview demo
# Showcases security best practices that Wiz would scan

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "gcs" {
    bucket = "wingspan-wiz-demo-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# VPC Network with custom subnets
resource "google_compute_network" "vpc" {
  name                    = "wingspan-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "wingspan-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  # Secondary ranges for pods and services
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Service Account for GKE nodes with minimal permissions
resource "google_service_account" "gke_nodes" {
  account_id   = "gke-nodes-wingspan"
  display_name = "GKE Nodes Service Account"
}

resource "google_project_iam_member" "gke_nodes_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "gke_nodes_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "gke_nodes_monitoring_viewer" {
  project = var.project_id
  role    = "roles/monitoring.viewer"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

# GKE Cluster - Standard tier for full K8s control
resource "google_container_cluster" "primary" {
  name     = "wingspan-cluster"
  location = var.region

  # Remove default node pool immediately
  remove_default_node_pool = true
  initial_node_count       = 1

  # Network configuration
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  # IP allocation for pods and services
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Security features - what Wiz scans for!
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enable security features
  enable_shielded_nodes = true
  
  # Network policy for pod-to-pod communication control
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Binary Authorization - prevent unauthorized containers
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Disable basic auth and client certificate
  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  # Enable useful addons
  addons_config {
    http_load_balancing {
      disabled = true # We'll use Ingress-NGINX instead
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
  }

  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  # Resource labels for cost tracking
  resource_labels = {
    environment = "demo"
    purpose     = "wiz-interview"
    managed_by  = "terraform"
  }
}

# Separate node pool with cost-optimized settings
resource "google_container_node_pool" "primary_nodes" {
  name       = "wingspan-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 2

  # Auto-scaling configuration
  autoscaling {
    min_node_count = 1
    max_node_count = 3
  }

  # Node configuration
  node_config {
    preemptible  = true # Reduce costs by 80%
    machine_type = "e2-small" # 2 vCPU, 2GB RAM - $13/month each

    # Disk configuration - reduced to fit quota
    disk_size_gb = 30  # Down from default 100GB
    disk_type    = "pd-standard" # Use standard disk instead of SSD

    # Security: Use custom service account
    service_account = google_service_account.gke_nodes.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Workload identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Shielded nodes
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    # Resource labels
    labels = {
      environment = "demo"
      node_pool   = "primary"
    }

    # Metadata - disable legacy metadata API
    metadata = {
      disable-legacy-endpoints = "true"
    }

    tags = ["wingspan-node", "gke-node"]
  }

  # Management settings
  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# Firewall rule to allow health checks from Ingress-NGINX
resource "google_compute_firewall" "ingress_health_check" {
  name    = "allow-ingress-health-check"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"] # In production, restrict this
  target_tags   = ["wingspan-node"]
}

# Configure kubectl access
data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = "https://${google_container_cluster.primary.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  }
}

# Outputs
output "cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE cluster name"
}

output "cluster_endpoint" {
  value       = google_container_cluster.primary.endpoint
  description = "GKE cluster endpoint"
  sensitive   = true
}

output "cluster_ca_certificate" {
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  description = "GKE cluster CA certificate"
  sensitive   = true
}

output "kubectl_config_command" {
  value       = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} --project ${var.project_id}"
  description = "Command to configure kubectl"
}
