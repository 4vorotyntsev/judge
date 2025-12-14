import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Users, Heart } from 'lucide-react';

const JudgesSummary = ({
    feedbacks,
    personas,
    swipeStats,
    onAskDates,
    loading,
    hasApiKey,
    selectedJudgeCount,
    isCurrentRound,
    hasImage
}) => {
    if (feedbacks.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Judges Summary</h2>
                </div>

                {/* Ask Dates Button - only show for current round with image */}
                {isCurrentRound && hasImage && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={onAskDates}
                        disabled={loading || !hasApiKey || selectedJudgeCount === 0}
                        className="w-full mb-4 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
                    >
                        <Heart className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
                        {loading ? 'Asking...' : `Ask ${selectedJudgeCount} ${selectedJudgeCount === 1 ? 'Date' : 'Dates'}`}
                    </motion.button>
                )}

                <div className="h-32 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center">
                        <div className="text-4xl mb-2">👀</div>
                        <p className="text-sm">
                            {isCurrentRound && hasImage
                                ? 'Click the button above to ask the judges!'
                                : 'Waiting for the judges to evaluate...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const yesVotes = feedbacks.filter(fb => fb.isSwipeRight);
    const noVotes = feedbacks.filter(fb => !fb.isSwipeRight);
    const yesPercentage = Math.round((swipeStats.yes / swipeStats.total) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Judges Summary</h2>
                        <p className="text-sm text-gray-500">{feedbacks.length} judges voted</p>
                    </div>
                </div>

                {/* Score indicator */}
                <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${yesPercentage >= 70
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-600'
                    : yesPercentage >= 40
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-600'
                        : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600'
                    }`}>
                    {yesPercentage >= 70 ? '🔥' : yesPercentage >= 40 ? '😐' : '💔'}
                    {yesPercentage}% approval
                </div>
            </div>

            {/* Votes breakdown */}
            <div className="grid grid-cols-2 gap-4">
                {/* Yes votes */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <ThumbsUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-green-700">Would Swipe Right</span>
                        <span className="ml-auto text-2xl font-bold text-green-600">{yesVotes.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {yesVotes.map((fb, idx) => {
                            const persona = personas.find(p => p.id === fb.personaId);
                            return (
                                <motion.div
                                    key={fb.personaId}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <img
                                        src={persona?.avatar}
                                        alt={persona?.name}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-green-300 shadow-sm object-cover"
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {persona?.name}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {yesVotes.length === 0 && (
                            <p className="text-sm text-green-500 italic">No yes votes yet</p>
                        )}
                    </div>
                </div>

                {/* No votes */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border-2 border-red-100">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                            <ThumbsDown className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-red-700">Would Swipe Left</span>
                        <span className="ml-auto text-2xl font-bold text-red-600">{noVotes.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {noVotes.map((fb, idx) => {
                            const persona = personas.find(p => p.id === fb.personaId);
                            return (
                                <motion.div
                                    key={fb.personaId}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <img
                                        src={persona?.avatar}
                                        alt={persona?.name}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-red-300 shadow-sm object-cover"
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {persona?.name}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {noVotes.length === 0 && (
                            <p className="text-sm text-red-500 italic">No rejections!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 relative">
                <div className="h-3 bg-gradient-to-r from-red-200 to-red-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${yesPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default JudgesSummary;
