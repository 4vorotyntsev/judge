import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

const SuggestionsPanel = ({ suggestions, combineLoading, onCombine, hasFeedbacks }) => {
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

                {/* Combine button (if has feedbacks but no suggestions yet) */}
                {hasFeedbacks && !suggestions && !combineLoading && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={onCombine}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        <Lightbulb className="w-4 h-4" />
                        Get Suggestions
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                )}
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
            ) : (
                <div className="flex items-center justify-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center">
                        <div className="text-4xl mb-2">✨</div>
                        <p className="text-sm text-gray-400">
                            {hasFeedbacks
                                ? 'Click "Get Suggestions" to see improvement tips'
                                : 'Get feedback from judges first to see suggestions'}
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SuggestionsPanel;
