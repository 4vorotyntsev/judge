import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowRight, Loader2, Image, Brain, Wand2 } from 'lucide-react';

const SuggestionsPanel = ({
    suggestions,
    combineLoading,
    onCombine,
    hasFeedbacks,
    onGenerate,
    generating,
    generateCount,
    isCurrentRound
}) => {
    // Handle both old format (string) and new format (object with thinking/prompt)
    const hasSuggestions = suggestions && (
        (typeof suggestions === 'string' && suggestions.length > 0) ||
        (typeof suggestions === 'object' && (suggestions.thinking || suggestions.prompt))
    );

    const thinkingText = typeof suggestions === 'object' ? suggestions.thinking : '';
    const promptText = typeof suggestions === 'object' ? suggestions.prompt : suggestions;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Improvement Suggestions</h2>
                        <p className="text-sm text-gray-500">AI-generated tips to improve your photo</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {combineLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
                            <Sparkles className="w-5 h-5 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Combining feedback...</p>
                    </div>
                </div>
            ) : hasSuggestions ? (
                <div className="space-y-4">
                    {/* Thinking Section */}
                    {thinkingText && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-blue-700 mb-2">Analysis</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                        {thinkingText}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Prompt Section */}
                    {promptText && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: thinkingText ? 0.1 : 0 }}
                            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Wand2 className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-purple-700 mb-2">Image Generation Prompt</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                        {promptText}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Generate Photos Button - only for current round */}
                    {isCurrentRound && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={onGenerate}
                            disabled={generating}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
                        >
                            {generating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Image className="h-5 w-5" />
                            )}
                            {generating ? 'Generating...' : `Generate ${generateCount} New Photo${generateCount > 1 ? 's' : ''}`}
                            {!generating && <ArrowRight className="h-5 w-5" />}
                        </motion.button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="text-center">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-sm text-gray-400">
                                {hasFeedbacks
                                    ? 'Click below to combine feedback into suggestions'
                                    : 'Get feedback from judges first to see suggestions'}
                            </p>
                        </div>
                    </div>

                    {/* Combine button (if has feedbacks but no suggestions yet) - only for current round */}
                    {hasFeedbacks && isCurrentRound && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={onCombine}
                            disabled={combineLoading}
                            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                        >
                            <Lightbulb className="w-5 h-5" />
                            Combine & Get Suggestions
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default SuggestionsPanel;
