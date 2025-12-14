import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import JudgeSelection from './components/JudgeSelection';
import RoundCard from './components/RoundCard';
import personasData from './data/personas.json';

// API BASE URL
const API_URL = 'http://localhost:8000/api';

function App() {
  const [openRouterKey, setOpenRouterKey] = useState('');

  // History of all rounds
  const [roundsHistory, setRoundsHistory] = useState([]);

  // Current round state
  const [currentRound, setCurrentRound] = useState({
    roundNumber: 1,
    image: null,
    imageFile: null,
    feedbacks: [],
    swipeStats: { yes: 0, total: 0 },
    suggestions: '',
    newImages: []
  });

  // Custom personas list (starts with default + custom ones)
  const [personas, setPersonas] = useState(personasData);

  // Selected judges (array of IDs instead of count)
  const [selectedJudges, setSelectedJudges] = useState([personasData[0]?.id].filter(Boolean));

  // Number of images to generate
  const [generateCount, setGenerateCount] = useState(2);

  // Swipe goal: "right" = want to be liked, "left" = want to be disliked
  const [swipeGoal, setSwipeGoal] = useState('right');

  const [loading, setLoading] = useState(false);
  const [combineLoading, setCombineLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Ref for scrolling to new rounds
  const bottomRef = useRef(null);

  // Auto-scroll when new round is added
  useEffect(() => {
    if (roundsHistory.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roundsHistory.length]);

  const handleImageUpload = (file) => {
    setCurrentRound(prev => ({
      ...prev,
      image: URL.createObjectURL(file),
      imageFile: file,
      feedbacks: [],
      swipeStats: { yes: 0, total: 0 },
      suggestions: '',
      newImages: []
    }));
  };

  const handleAddCustomJudge = (customJudge) => {
    const newJudge = {
      id: `custom-${Date.now()}`,
      name: customJudge.name,
      bio: customJudge.bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customJudge.name)}`,
      isCustom: true
    };
    setPersonas([...personas, newJudge]);
    // Auto-select the new judge
    setSelectedJudges([...selectedJudges, newJudge.id]);
  };

  const handleAskGirls = async () => {
    if (!currentRound.imageFile || !openRouterKey || selectedJudges.length === 0) return;

    setLoading(true);
    setCurrentRound(prev => ({
      ...prev,
      feedbacks: [],
      swipeStats: { yes: 0, total: 0 }
    }));

    // Get selected personas by their IDs
    const selectedPersonas = personas.filter(p => selectedJudges.includes(p.id));

    const promises = selectedPersonas.map(async (persona) => {
      const formData = new FormData();
      formData.append('openRouterKey', openRouterKey);
      formData.append('persona', JSON.stringify(persona));
      formData.append('image', currentRound.imageFile);

      try {
        const res = await fetch(`${API_URL}/evaluate`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        return {
          personaId: persona.id,
          content: data.content || data.reason,
          reason: data.reason,
          likes: data.likes || '',
          dislikes: data.dislikes || '',
          keep: data.keep || '',
          change: data.change || '',
          isSwipeRight: data.swipe === "right"
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null);

    const yesCount = validResults.filter(r => r.isSwipeRight).length;

    setCurrentRound(prev => ({
      ...prev,
      feedbacks: validResults,
      swipeStats: { yes: yesCount, total: validResults.length }
    }));

    setLoading(false);
  };

  const handleCombine = async () => {
    if (currentRound.feedbacks.length === 0) return;
    setCombineLoading(true);

    try {
      const res = await fetch(`${API_URL}/combine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openRouterKey,
          goal: swipeGoal,
          feedbacks: currentRound.feedbacks.map(f => ({
            name: personas.find(p => p.id === f.personaId)?.name || 'Unknown',
            content: f.content,
            likes: f.likes || '',
            dislikes: f.dislikes || '',
            keep: f.keep || '',
            change: f.change || ''
          }))
        })
      });
      const data = await res.json();
      setCurrentRound(prev => ({
        ...prev,
        suggestions: data.summary
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setCombineLoading(false);
    }
  };

  // Handler for generate button click
  const handleGenerateClick = () => {
    if (currentRound.suggestions) {
      handleGenerate(currentRound.suggestions);
    }
  };

  const handleGenerate = async (suggestionText) => {
    setCombineLoading(false);
    setGenerating(true);

    try {
      const formData = new FormData();
      formData.append('openRouterKey', openRouterKey);
      formData.append('suggestions', suggestionText);
      formData.append('count', generateCount.toString());

      // Include original image for reference
      if (currentRound.imageFile) {
        formData.append('originalImage', currentRound.imageFile);
      }

      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setCurrentRound(prev => ({
        ...prev,
        newImages: data.images || []
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectNewImage = async (imgUrl) => {
    // Save current round to history
    setRoundsHistory(prev => [...prev, { ...currentRound }]);

    // Convert image URL to File object for the next round
    let newImageFile = null;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      newImageFile = new File([blob], `round_${currentRound.roundNumber + 1}.jpg`, { type: "image/jpeg" });
    } catch (err) {
      console.error("Error converting selected image to file", err);
    }

    // Start new round with the selected image
    setCurrentRound({
      roundNumber: currentRound.roundNumber + 1,
      image: imgUrl,
      imageFile: newImageFile,
      feedbacks: [],
      swipeStats: { yes: 0, total: 0 },
      suggestions: '',
      newImages: []
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <Sidebar
        openRouterKey={openRouterKey}
        setOpenRouterKey={setOpenRouterKey}
        selectedJudgeCount={selectedJudges.length}
        swipeGoal={swipeGoal}
        setSwipeGoal={setSwipeGoal}
        generateCount={generateCount}
        setGenerateCount={setGenerateCount}
      />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">
        {/* Judge Selection - sticky at top */}
        <JudgeSelection
          personas={personas}
          selectedJudges={selectedJudges}
          setSelectedJudges={setSelectedJudges}
          onAddCustomJudge={handleAddCustomJudge}
        />

        {/* Historical Rounds Feed */}
        {roundsHistory.map((round, index) => (
          <RoundCard
            key={`round-${round.roundNumber}`}
            roundNumber={round.roundNumber}
            image={round.image}
            feedbacks={round.feedbacks}
            suggestions={round.suggestions}
            swipeStats={round.swipeStats}
            newImages={round.newImages}
            personas={personas}
            isCurrentRound={false}
            loading={false}
            combineLoading={false}
            generating={false}
            generateCount={generateCount}
            onImageUpload={() => { }}
            onCombine={() => { }}
            onSelectNewImage={() => { }}
            onAskDates={() => { }}
            onGenerate={() => { }}
            hasApiKey={!!openRouterKey}
            selectedJudgeCount={selectedJudges.length}
          />
        ))}

        {/* Current Round */}
        <RoundCard
          roundNumber={currentRound.roundNumber}
          image={currentRound.image}
          feedbacks={currentRound.feedbacks}
          suggestions={currentRound.suggestions}
          swipeStats={currentRound.swipeStats}
          newImages={currentRound.newImages}
          personas={personas}
          isCurrentRound={true}
          loading={loading}
          combineLoading={combineLoading}
          generating={generating}
          generateCount={generateCount}
          onImageUpload={handleImageUpload}
          onCombine={handleCombine}
          onSelectNewImage={handleSelectNewImage}
          onAskDates={handleAskGirls}
          onGenerate={handleGenerateClick}
          hasApiKey={!!openRouterKey}
          selectedJudgeCount={selectedJudges.length}
        />

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-10" />
      </main>
    </div>
  );
}

export default App;
