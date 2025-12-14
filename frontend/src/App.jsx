import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainStage from './components/MainStage';
import JudgeSelection from './components/JudgeSelection';
import FeedbackStack from './components/FeedbackStack';
import JudgesSummary from './components/JudgesSummary';
import SuggestionsPanel from './components/SuggestionsPanel';
import NewPicsSelection from './components/NewPicsSelection';
import personasData from './data/personas.json';

// API BASE URL
const API_URL = 'http://localhost:8000/api';

function App() {
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [image, setImage] = useState(null); // Preview URL
  const [imageFile, setImageFile] = useState(null); // Actual file for upload

  const [round, setRound] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [swipeStats, setSwipeStats] = useState({ yes: 0, total: 0 });
  const [suggestions, setSuggestions] = useState('');
  const [newImages, setNewImages] = useState([]);

  // Custom personas list (starts with default + custom ones)
  const [personas, setPersonas] = useState(personasData);

  // Selected judges (array of IDs instead of count)
  const [selectedJudges, setSelectedJudges] = useState([personasData[0]?.id].filter(Boolean));

  // Number of images to generate
  const [generateCount, setGenerateCount] = useState(2);

  const [loading, setLoading] = useState(false);
  const [combineLoading, setCombineLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleImageUpload = (file) => {
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    // Reset state for new round
    setFeedbacks([]);
    setSwipeStats({ yes: 0, total: 0 });
    setSuggestions('');
    setNewImages([]);
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
    if (!imageFile || !openRouterKey || selectedJudges.length === 0) return;

    setLoading(true);
    setFeedbacks([]);
    setSwipeStats({ yes: 0, total: 0 });

    // Get selected personas by their IDs
    const selectedPersonas = personas.filter(p => selectedJudges.includes(p.id));

    const promises = selectedPersonas.map(async (persona) => {
      const formData = new FormData();
      formData.append('openRouterKey', openRouterKey);
      formData.append('persona', JSON.stringify(persona));
      formData.append('image', imageFile);

      try {
        const res = await fetch(`${API_URL}/evaluate`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        return {
          personaId: persona.id,
          content: data.reason || data.content,
          isSwipeRight: data.swipe_right === true
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null);

    setFeedbacks(validResults);

    const yesCount = validResults.filter(r => r.isSwipeRight).length;
    setSwipeStats({ yes: yesCount, total: validResults.length });

    setLoading(false);
  };

  const handleCombine = async () => {
    if (feedbacks.length === 0) return;
    setCombineLoading(true);

    try {
      const res = await fetch(`${API_URL}/combine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openRouterKey,
          feedbacks: feedbacks.map(f => ({
            personaName: personas.find(p => p.id === f.personaId)?.name || 'Unknown',
            content: f.content
          }))
        })
      });
      const data = await res.json();
      setSuggestions(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setCombineLoading(false);
    }
  };

  // Handler for generate button click
  const handleGenerateClick = () => {
    if (suggestions) {
      handleGenerate(suggestions);
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
      if (imageFile) {
        formData.append('originalImage', imageFile);
      }

      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setNewImages(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectNewImage = async (imgUrl) => {
    // Round continues
    setRound(r => r + 1);
    setImage(imgUrl);

    // Convert image URL to File object for the next round
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], `round_${round + 1}.jpg`, { type: "image/jpeg" });
      setImageFile(file);
    } catch (err) {
      console.error("Error converting selected image to file", err);
    }

    // Reset for new round
    setFeedbacks([]);
    setSwipeStats({ yes: 0, total: 0 });
    setSuggestions('');
    setNewImages([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <Sidebar
        openRouterKey={openRouterKey}
        setOpenRouterKey={setOpenRouterKey}
        onAskGirls={handleAskGirls}
        onCombine={handleCombine}
        onGenerate={handleGenerateClick}
        loading={loading}
        combineLoading={combineLoading}
        generating={generating}
        hasFeedbacks={feedbacks.length > 0}
        hasSuggestions={!!suggestions}
        selectedJudgeCount={selectedJudges.length}
        generateCount={generateCount}
        setGenerateCount={setGenerateCount}
        swipeStats={swipeStats}
        round={round}
      />

      <main className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
        {/* Judge Selection */}
        <JudgeSelection
          personas={personas}
          selectedJudges={selectedJudges}
          setSelectedJudges={setSelectedJudges}
          onAddCustomJudge={handleAddCustomJudge}
        />

        {/* Main content area: Photo + Judges Summary side by side */}
        <div className="flex gap-6 min-h-[350px]">
          {/* Main Stage - Photo upload */}
          <div className="w-1/2">
            <MainStage image={image} onImageUpload={handleImageUpload} />
          </div>

          {/* Judges Summary - visual overview of votes */}
          <div className="w-1/2">
            <JudgesSummary
              feedbacks={feedbacks}
              personas={personas}
              swipeStats={swipeStats}
            />
          </div>
        </div>

        {/* Suggestions Panel - stacked below */}
        <SuggestionsPanel
          suggestions={suggestions}
          combineLoading={combineLoading}
          onCombine={handleCombine}
          hasFeedbacks={feedbacks.length > 0}
        />

        {/* Detailed Feedback from each judge */}
        <FeedbackStack feedbacks={feedbacks} personas={personas} />

        <NewPicsSelection
          newImages={newImages}
          onSelect={handleSelectNewImage}
          generating={generating}
          generateCount={generateCount}
        />

        {/* Spacer for bottom scroll */}
        <div className="h-10" />
      </main>
    </div>
  );
}

export default App;
