import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowRight, Loader2, Image } from 'lucide-react';

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
            ) : suggestions ? (
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lightbulb className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {suggestions}
                                </p>
                            </div>
                        </div>
                    </motion.div>

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
