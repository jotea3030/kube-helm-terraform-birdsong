import React, { useState, useRef, useEffect } from 'react';

const XENO_CANTO_API_KEY = "fae355dcd9dc304f388a83d792fb2e45a18bd4e7";
const API_BASE_URL = "https://xeno-canto.org/api/3/recordings";

const WingspanBirds = [
  "American Robin", "American Goldfinch", "American Crow", "Blue Jay",
  "Northern Cardinal", "Black-capped Chickadee", "House Sparrow", "Mourning Dove",
  "Red-winged Blackbird", "Song Sparrow", "Common Grackle", "European Starling",
  "House Finch", "Barn Swallow", "American Kestrel", "Red-tailed Hawk",
  "Bald Eagle", "Great Blue Heron", "Mallard", "Canada Goose",
  "European Robin", "Common Blackbird", "Common Chaffinch", "Great Tit",
  "Australian Magpie", "Laughing Kookaburra", "Galah", "Tui",
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
