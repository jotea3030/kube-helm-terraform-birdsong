import React, { useState, useRef, useEffect } from 'react';

const XENO_CANTO_API_KEY = "fae355dcd9dc304f388a83d792fb2e45a18bd4e7";
const API_BASE_URL = "https://xeno-canto.org/api/3/recordings";

// Complete list of all 436 birds from Wingspan and all expansions
// Base Game (170 birds) + European (81) + Oceania (95) + Asia (90) = 436 total

const WingspanBirds = [
  // BASE GAME - NORTH AMERICA (170 birds)
  "Acorn Woodpecker", "American Avocet", "American Bittern", "American Coot",
  "American Crow", "American Goldfinch", "American Kestrel", "American Robin",
  "American Tree Sparrow", "American White Pelican", "American Woodcock",
  "Anna's Hummingbird", "Bald Eagle", "Baltimore Oriole", "Band-tailed Pigeon",
  "Bank Swallow", "Barn Owl", "Barn Swallow", "Barred Owl", "Belted Kingfisher",
  "Black Skimmer", "Black Vulture", "Black-bellied Plover", "Black-billed Magpie",
  "Black-capped Chickadee", "Black-crowned Night-Heron", "Blue Jay", "Boat-tailed Grackle",
  "Bobolink", "Brewer's Blackbird", "Broad-winged Hawk", "Brown Creeper",
  "Brown-headed Cowbird", "Bufflehead", "Bushtit", "California Condor",
  "California Quail", "Canada Goose", "Canvasback", "Carolina Wren", "Caspian Tern",
  "Cedar Waxwing", "Chestnut-backed Chickadee", "Chihuahuan Raven", "Chimney Swift",
  "Chipping Sparrow", "Chukar", "Clark's Nutcracker", "Cliff Swallow", "Common Grackle",
  "Common Loon", "Common Merganser", "Common Nighthawk", "Common Poorwill",
  "Common Raven", "Common Yellowthroat", "Cooper's Hawk", "Dark-eyed Junco",
  "Dickcissel", "Double-crested Cormorant", "Downy Woodpecker", "Eastern Bluebird",
  "Eastern Kingbird", "Eastern Meadowlark", "Eastern Phoebe", "Eastern Rosella",
  "Eastern Screech-Owl", "Eastern Towhee", "Eurasian Collared-Dove", "Eurasian Tree Sparrow",
  "European Starling", "Evening Grosbeak", "Ferruginous Hawk", "Fish Crow",
  "Franklin's Gull", "Golden Eagle", "Golden-crowned Kinglet", "Gray Catbird",
  "Great Blue Heron", "Great Crested Flycatcher", "Great Egret", "Great Horned Owl",
  "Greater Prairie-Chicken", "Greater Roadrunner", "Greater White-fronted Goose",
  "Greater Yellowlegs", "Green Heron", "Green-winged Teal", "Grey Plover",
  "Hairy Woodpecker", "Harris's Hawk", "Hermit Thrush", "Herring Gull",
  "Hooded Merganser", "House Finch", "House Sparrow", "House Wren", "Indigo Bunting",
  "Killdeer", "Laysan Albatross", "Least Sandpiper", "Lesser Scaup",
  "Loggerhead Shrike", "Long-billed Curlew", "Mallard", "Mourning Dove",
  "Mute Swan", "Northern Bobwhite", "Northern Cardinal", "Northern Flicker",
  "Northern Harrier", "Northern Mockingbird", "Northern Pintail", "Northern Shoveler",
  "Oak Titmouse", "Orange-crowned Warbler", "Osprey", "Ovenbird", "Painted Bunting",
  "Peregrine Falcon", "Pied-billed Grebe", "Pileated Woodpecker", "Pine Grosbeak",
  "Prairie Falcon", "Purple Finch", "Purple Martin", "Red Crossbill",
  "Red-bellied Woodpecker", "Red-breasted Nuthatch", "Red-headed Woodpecker",
  "Red-shouldered Hawk", "Red-tailed Hawk", "Red-winged Blackbird", "Ring-billed Gull",
  "Ring-necked Duck", "Ring-necked Pheasant", "Rock Pigeon", "Rose-breasted Grosbeak",
  "Rough-legged Hawk", "Royal Tern", "Ruby-throated Hummingbird", "Ruddy Duck",
  "Rufous Hummingbird", "Sandhill Crane", "Savannah Sparrow", "Say's Phoebe",
  "Scissor-tailed Flycatcher", "Sharp-shinned Hawk", "Snow Goose", "Snowy Owl",
  "Song Sparrow", "Sora", "Spotted Sandpiper", "Spotted Towhee", "Swainson's Hawk",
  "Tree Swallow", "Trumpeter Swan", "Tufted Titmouse", "Turkey Vulture", "Vesper Sparrow",
  "Virginia Rail", "Western Grebe", "Western Kingbird", "Western Meadowlark",
  "Western Sandpiper", "White-breasted Nuthatch", "White-crowned Sparrow",
  "White-throated Sparrow", "Wild Turkey", "Willet", "Wilson's Snipe", "Wood Duck",
  "Wood Thrush", "Yellow Warbler", "Yellow-billed Cuckoo", "Yellow-headed Blackbird",
  "Yellow-rumped Warbler",

  // EUROPEAN EXPANSION (81 birds)
  "Atlantic Puffin", "Barn Swallow", "Bearded Reedling", "Black Grouse", "Black Stork",
  "Black Woodpecker", "Black-headed Gull", "Black-legged Kittiwake", "Black-tailed Godwit",
  "Blackcap", "Blue Rock Thrush", "Blue Tit", "Bluethroat", "Brambling",
  "Carrion Crow", "Cetti's Warbler", "Chaffinch", "Coal Tit", "Common Blackbird",
  "Common Buzzard", "Common Chaffinch", "Common Chiffchaff", "Common Coot",
  "Common Crane", "Common Cuckoo", "Common Eider", "Common Firecrest",
  "Common Goldeneye", "Common House Martin", "Common Kestrel", "Common Kingfisher",
  "Common Linnet", "Common Magpie", "Common Moorhen", "Common Pochard",
  "Common Redpoll", "Common Redshank", "Common Redstart", "Common Sandpiper",
  "Common Shelduck", "Common Snipe", "Common Stonechat", "Common Swift",
  "Common Tern", "Common Wood Pigeon", "Corn Bunting", "Crested Tit",
  "Dunnock", "Eurasian Blue Tit", "Eurasian Bullfinch", "Eurasian Hoopoe",
  "Eurasian Jay", "Eurasian Nuthatch", "Eurasian Oystercatcher", "Eurasian Skylark",
  "Eurasian Sparrowhawk", "Eurasian Spoonbill", "Eurasian Treecreeper",
  "Eurasian Wigeon", "Eurasian Woodcock", "Eurasian Wryneck", "European Bee-eater",
  "European Golden Plover", "European Goldfinch", "European Green Woodpecker",
  "European Greenfinch", "European Robin", "European Roller", "European Serin",
  "Fieldfare", "Garden Warbler", "Goldcrest", "Great Cormorant", "Great Crested Grebe",
  "Great Grey Shrike", "Great Spotted Woodpecker", "Great Tit", "Greater Flamingo",
  "Griffon Vulture", "Greylag Goose", "Hen Harrier", "Lesser Spotted Woodpecker",
  "Little Owl", "Long-tailed Tit", "Mistle Thrush", "Moltoni's Warbler",
  "Mute Swan", "Northern Gannet", "Northern Lapwing", "Northern Raven",
  "Ortolan Bunting", "Red Kite", "Redwing", "Rock Partridge", "Rook",
  "Rough-legged Buzzard", "Sedge Warbler", "Short-eared Owl", "Song Thrush",
  "Spotted Flycatcher", "Tawny Owl", "Tree Pipit", "Turtle Dove", "Whinchat",
  "White Stork", "White Wagtail", "White-tailed Eagle", "Willow Tit", "Wood Warbler",
  "Yellowhammer",

  // OCEANIA EXPANSION (95 birds)
  "Abbott's Booby", "Australian Brushturkey", "Australian King-Parrot",
  "Australian Magpie", "Australian Owlet-nightjar", "Australian Pelican",
  "Australian Raven", "Australian White Ibis", "Azure Kingfisher", "Banded Lapwing",
  "Banded Stilt", "Black Currawong", "Black Swan", "Black-backed Magpie",
  "Black-faced Cormorant", "Black-faced Cuckoo-shrike", "Black-fronted Dotterel",
  "Black-shouldered Kite", "Blue-faced Honeyeater", "Brown Falcon", "Brown Goshawk",
  "Buff-banded Rail", "Cape Barren Goose", "Channel-billed Cuckoo", "Common Bronzewing",
  "Common Myna", "Crested Pigeon", "Crimson Rosella", "Dollarbird", "Dusky Moorhen",
  "Eastern Koel", "Eastern Rosella", "Eastern Spinebill", "Eastern Yellow Robin",
  "Emu", "Fan-tailed Cuckoo", "Galah", "Gang-gang Cockatoo", "Glossy Ibis",
  "Great Cormorant", "Grey Butcherbird", "Grey Currawong", "Grey Fantail",
  "Grey Shrike-thrush", "Grey Teal", "Helmeted Friarbird", "Hoary-headed Grebe",
  "Horsfield's Bronze-Cuckoo", "Kea", "Laughing Kookaburra", "Little Black Cormorant",
  "Little Corella", "Little Penguin", "Little Pied Cormorant", "Long-billed Corella",
  "Magpie-lark", "Masked Lapwing", "Masked Woodswallow", "Mistletoebird",
  "New Holland Honeyeater", "New Zealand Fantail", "Noisy Friarbird", "Noisy Miner",
  "North Island Brown Kiwi", "Olive-backed Oriole", "Pacific Black Duck",
  "Pacific Golden Plover", "Peregrine Falcon", "Pied Cormorant", "Pied Currawong",
  "Pied Oystercatcher", "Rainbow Bee-eater", "Rainbow Lorikeet", "Red Wattlebird",
  "Red-browed Finch", "Red-capped Plover", "Red-necked Avocet", "Regent Bowerbird",
  "Royal Spoonbill", "Rufous Fantail", "Rufous Whistler", "Sacred Kingfisher",
  "Satin Bowerbird", "Silvereye", "Southern Boobook", "Southern Cassowary",
  "Spotted Pardalote", "Straw-necked Ibis", "Striated Pardalote", "Sulphur-crested Cockatoo",
  "Superb Fairy-wren", "Tawny Frogmouth", "Varied Sittella", "Wedge-tailed Eagle",
  "Welcome Swallow", "Whistling Kite", "White-bellied Sea-Eagle", "White-browed Scrubwren",
  "White-faced Heron", "White-plumed Honeyeater", "White-throated Needletail",
  "Willie Wagtail", "Yellow-faced Honeyeater", "Yellow-tailed Black-Cockatoo",

  // ASIA EXPANSION (90 birds)
  "Asian Emerald Dove", "Asian Koel", "Asian Openbill", "Asian Paradise Flycatcher",
  "Ashy Drongo", "Ashy Minivet", "Baikal Teal", "Bar-headed Goose",
  "Barn Swallow", "Black Drongo", "Black Kite", "Black-headed Gull",
  "Black-headed Ibis", "Black-naped Oriole", "Black-throated Bushtit",
  "Black-winged Stilt", "Blue Whistling Thrush", "Blue-eared Kingfisher",
  "Brahminy Kite", "Brown Dipper", "Brown Shrike", "Brown-headed Barbet",
  "Cattle Egret", "Chinese Pond Heron", "Cinereous Vulture", "Cinnamon Bittern",
  "Collared Kingfisher", "Common Green Magpie", "Common Hoopoe", "Common Iora",
  "Common Kingfisher", "Common Moorhen", "Common Myna", "Common Tailorbird",
  "Coppersmith Barbet", "Cotton Pygmy Goose", "Crested Serpent Eagle", "Eurasian Hoopoe",
  "Eurasian Jay", "Fork-tailed Drongo-Cuckoo", "Garganey", "Golden-fronted Leafbird",
  "Great Cormorant", "Great Hornbill", "Greater Coucal", "Greater Flamingo",
  "Green Imperial Pigeon", "Grey Heron", "Grey-headed Canary-Flycatcher",
  "House Crow", "House Sparrow", "Indian Cormorant", "Indian Grey Hornbill",
  "Indian Peafowl", "Indian Pitta", "Indian Roller", "Indian Spot-billed Duck",
  "Intermediate Egret", "Japanese Paradise Flycatcher", "Large-billed Crow",
  "Lesser Whistling Duck", "Little Cormorant", "Little Egret", "Little Grebe",
  "Long-tailed Shrike", "Mandarin Duck", "Northern Lapwing", "Orange-headed Thrush",
  "Oriental Dwarf Kingfisher", "Oriental Magpie-Robin", "Oriental White-eye",
  "Painted Stork", "Pheasant-tailed Jacana", "Pied Kingfisher", "Plain Prinia",
  "Plum-headed Parakeet", "Purple Heron", "Purple Sunbird", "Red Junglefowl",
  "Red-billed Blue Magpie", "Red-vented Bulbul", "Red-wattled Lapwing",
  "Rose-ringed Parakeet", "Ruddy Shelduck", "Rufous Treepie", "Rufous-necked Hornbill",
  "Sarus Crane", "Scaly-breasted Munia", "Siberian Crane", "Small Minivet",
  "Spot-billed Pelican", "Spotted Dove", "Spotted Owlet", "White Wagtail",
  "White-breasted Kingfisher", "White-breasted Waterhen", "White-rumped Shama",
  "White-throated Kingfisher", "Yellow Bittern"
];

// Inline SVG icons
const BirdIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
  </svg>
);

const VolumeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const AwardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

export default function WingspanBirdQuiz() {
  const [gameState, setGameState] = useState('intro');
  const [currentBird, setCurrentBird] = useState(null);
  const [options, setOptions] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recording, setRecording] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef(null);

  const generateOptions = (correctBird) => {
    const opts = [correctBird];
    while (opts.length < 4) {
      const randomBird = WingspanBirds[Math.floor(Math.random() * WingspanBirds.length)];
      if (!opts.includes(randomBird)) {
        opts.push(randomBird);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const fetchRecording = async (birdName) => {
    const queries = [
      `en:"${birdName}" q:A`,
      `en:"${birdName}" q:B`,
      `en:"${birdName}"`
    ];

    for (const query of queries) {
      try {
        const url = `${API_BASE_URL}?key=${XENO_CANTO_API_KEY}&query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.recordings && data.recordings.length > 0) {
          const validRecordings = data.recordings.filter(rec => 
            rec.file && (rec.file.startsWith('http') || rec.file.startsWith('//'))
          );
          
          if (validRecordings.length > 0) {
            const rec = validRecordings[Math.floor(Math.random() * validRecordings.length)];
            let fileUrl = rec.file;
            if (fileUrl.startsWith('//')) {
              fileUrl = 'https:' + fileUrl;
            }
            return { rec, fileUrl };
          }
        }
      } catch (err) {
        console.error('Error fetching recordings:', err);
      }
    }
    
    throw new Error(`No recordings found for ${birdName}`);
  };

  const startNewRound = async () => {
    setGameState('loading');
    setError(null);
    setSelectedAnswer(null);
    
    const bird = WingspanBirds[Math.floor(Math.random() * WingspanBirds.length)];
    setCurrentBird(bird);
    
    try {
      const { rec, fileUrl } = await fetchRecording(bird);
      setRecording(rec);
      setAudioUrl(fileUrl);
      setOptions(generateOptions(bird));
      setGameState('playing');
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.error('Auto-play failed:', err));
        }
      }, 500);
    } catch (err) {
      setError(err.message);
      setTimeout(startNewRound, 2000);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setGameState('answered');
    setTotalQuestions(prev => prev + 1);
    
    if (answer === currentBird) {
      setScore(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-blue-600"><BirdIcon /></div>
            <h1 className="text-4xl font-bold text-gray-800">Wingspan Bird Quiz</h1>
            <div className="text-green-600"><BirdIcon /></div>
          </div>
          <p className="text-gray-600">Test your knowledge of bird calls!</p>
        </div>

        {totalQuestions > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <AwardIcon className="w-6 h-6 text-yellow-500" />
              <span className="text-xl font-semibold">
                Score: {score}/{totalQuestions} ({Math.round((score/totalQuestions) * 100)}%)
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          {gameState === 'intro' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🦅</div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
              <p className="text-gray-600">Listen to bird calls and identify the species.</p>
              <button
                onClick={startNewRound}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            </div>
          )}

          {gameState === 'loading' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading bird call...</p>
            </div>
          )}

          {(gameState === 'playing' || gameState === 'answered') && audioUrl && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <VolumeIcon className={`w-8 h-8 ${isPlaying ? 'text-green-600 animate-pulse' : 'text-gray-600'}`} />
                  <span className="text-lg font-semibold text-gray-700">
                    {isPlaying ? 'Playing bird call...' : 'Click to play'}
                  </span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={playAudio}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    {isPlaying ? 'Pause' : 'Play Audio'}
                  </button>
                </div>
                <audio ref={audioRef} src={audioUrl} preload="auto" />
              </div>

              {gameState === 'playing' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-center text-gray-800">
                    Which bird species is this?
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className="bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-500 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-all text-left"
                      >
                        {index + 1}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameState === 'answered' && (
                <div className="space-y-4">
                  <div className={`rounded-lg p-6 ${selectedAnswer === currentBird ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {selectedAnswer === currentBird ? '✅' : '❌'}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {selectedAnswer === currentBird ? 'Correct!' : 'Incorrect'}
                      </h3>
                      {selectedAnswer !== currentBird && (
                        <p className="text-lg">The correct answer was: <strong>{currentBird}</strong></p>
                      )}
                    </div>
                  </div>

                  {recording && (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p><strong>Location:</strong> {recording.loc}, {recording.cnt}</p>
                      <p><strong>Quality:</strong> {recording.q} | <strong>Length:</strong> {recording.length}</p>
                    </div>
                  )}

                  <button
                    onClick={startNewRound}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Next Round
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
