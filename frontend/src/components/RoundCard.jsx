import React from 'react';
import { motion } from 'framer-motion';
import MainStage from './MainStage';
import JudgesSummary from './JudgesSummary';
import FeedbackStack from './FeedbackStack';
import SuggestionsPanel from './SuggestionsPanel';
import NewPicsSelection from './NewPicsSelection';

const RoundCard = ({
    roundNumber,
    image,
    feedbacks,
    suggestions,
    swipeStats,
    newImages,
    personas,
    isCurrentRound,
    loading,
    combineLoading,
    generating,
    generateCount,
    onImageUpload,
    onCombine,
    onSelectNewImage,
    onAskDates,
    onGenerate,
    hasApiKey,
    selectedJudgeCount
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            className="relative"
        >
            {/* Round Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${isCurrentRound
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                    {roundNumber}
                </div>
                <h2 className={`text-lg font-bold ${isCurrentRound ? 'text-gray-800' : 'text-gray-500'}`}>
                    Round {roundNumber}
                    {isCurrentRound && <span className="ml-2 text-sm font-normal text-purple-500">(Current)</span>}
                </h2>
            </div>

            {/* Round Content */}
            <div className={`pl-5 ml-4 border-l-2 ${isCurrentRound ? 'border-purple-200' : 'border-gray-200'} space-y-6`}>
                {/* Main content area: Photo + Judges Summary side by side */}
                <div className="flex gap-6 min-h-[350px]">
                    {/* Main Stage - Photo upload (only for current round) */}
                    <div className="w-1/2">
                        {isCurrentRound ? (
                            <MainStage image={image} onImageUpload={onImageUpload} />
                        ) : (
                            <div className="bg-white rounded-3xl p-4 border-2 border-gray-100 shadow-sm h-full flex items-center justify-center">
                                <img
                                    src={image}
                                    alt={`Round ${roundNumber}`}
                                    className="max-h-[300px] w-auto object-contain rounded-2xl"
                                />
                            </div>
                        )}
                    </div>

                    {/* Judges Summary - visual overview of votes */}
                    <div className="w-1/2">
                        <JudgesSummary
                            feedbacks={feedbacks}
                            personas={personas}
                            swipeStats={swipeStats}
                            onAskDates={onAskDates}
                            loading={loading}
                            hasApiKey={hasApiKey}
                            selectedJudgeCount={selectedJudgeCount}
                            isCurrentRound={isCurrentRound}
                            hasImage={!!image}
                        />
                    </div>
                </div>

                {/* Detailed Feedback from each judge */}
                {feedbacks.length > 0 && (
                    <FeedbackStack feedbacks={feedbacks} personas={personas} />
                )}

                {/* Suggestions Panel */}
                {(isCurrentRound || (suggestions && (suggestions.thinking || suggestions.prompt))) && (
                    <SuggestionsPanel
                        suggestions={suggestions}
                        combineLoading={isCurrentRound ? combineLoading : false}
                        onCombine={onCombine}
                        hasFeedbacks={feedbacks.length > 0}
                        onGenerate={onGenerate}
                        generating={generating}
                        generateCount={generateCount}
                        isCurrentRound={isCurrentRound}
                    />
                )}

                {/* New Pics Selection - show for all rounds with generated images */}
                {(newImages?.length > 0 || (isCurrentRound && generating)) && (
                    <NewPicsSelection
                        newImages={newImages}
                        onSelect={isCurrentRound ? onSelectNewImage : null}
                        generating={isCurrentRound ? generating : false}
                        generateCount={generateCount}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default RoundCard;
