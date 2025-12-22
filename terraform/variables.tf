# terraform/variables.tf

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "wingspan-cluster"
}

variable "node_machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "e2-small" # 2 vCPU, 2GB RAM - cost-effective
}

variable "min_node_count" {
  description = "Minimum number of nodes in the node pool"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes in the node pool"
  type        = number
  default     = 3
}

variable "initial_node_count" {
  description = "Initial number of nodes in the node pool"
  type        = number
  default     = 2
}

variable "enable_preemptible_nodes" {
  description = "Use preemptible nodes to reduce costs by 80%"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "demo"
}

variable "enable_binary_authorization" {
  description = "Enable binary authorization for image verification"
  type        = bool
  default     = true
}

variable "enable_workload_identity" {
  description = "Enable workload identity for secure pod authentication"
  type        = bool
  default     = true
}

variable "enable_shielded_nodes" {
  description = "Enable shielded GKE nodes for enhanced security"
  type        = bool
  default     = true
}

variable "enable_network_policy" {
  description = "Enable network policy for pod-to-pod traffic control"
  type        = bool
  default     = true
}

variable "pod_cidr" {
  description = "CIDR range for pods"
  type        = string
  default     = "10.1.0.0/16"
}

variable "service_cidr" {
  description = "CIDR range for services"
  type        = string
  default     = "10.2.0.0/16"
}

variable "master_ipv4_cidr_block" {
  description = "CIDR block for GKE master (control plane)"
  type        = string
  default     = "172.16.0.0/28"
}
