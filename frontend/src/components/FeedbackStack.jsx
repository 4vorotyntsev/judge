import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const FeedbackStack = ({ feedbacks, personas }) => {
    if (feedbacks.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-center">
                    <div className="text-4xl mb-2">👀</div>
                    <p>Waiting for the judges to evaluate...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🗣️</span>
                Feedback
                <span className="text-sm font-normal text-gray-400">({feedbacks.length} responses)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedbacks.map((fb, idx) => {
                    const persona = personas.find(p => p.id === fb.personaId);
                    const isSwipeRight = fb.isSwipeRight;

                    return (
                        <motion.div
                            key={fb.personaId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${isSwipeRight
                                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                                : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                                }`}
                        >
                            {/* Verdict badge */}
                            <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md ${isSwipeRight
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                }`}>
                                {isSwipeRight ? (
                                    <>
                                        <ThumbsUp className="w-3 h-3" />
                                        Yes
                                    </>
                                ) : (
                                    <>
                                        <ThumbsDown className="w-3 h-3" />
                                        No
                                    </>
                                )}
                            </div>

                            {/* Header with avatar */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={persona?.avatar}
                                    alt={persona?.name}
                                    className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-sm"
                                />
                                <div>
                                    <h4 className="font-bold text-gray-800">{persona?.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">{persona?.bio}</p>
                                </div>
                            </div>

                            {/* Feedback content - structured sections */}
                            <div className="space-y-2 text-sm">
                                {/* Reason */}
                                {fb.reason && (
                                    <p className="text-gray-600 leading-relaxed italic">
                                        "{fb.reason}"
                                    </p>
                                )}

                                {/* Likes */}
                                {fb.likes && (
                                    <div className="flex items-start gap-2 bg-green-50 p-2 rounded-lg border border-green-100">
                                        <span className="text-green-600 font-medium text-xs min-w-[80px] shrink-0">❤️ Likes:</span>
                                        <p className="text-gray-700 text-xs">{fb.likes}</p>
                                    </div>
                                )}

                                {/* Dislikes */}
                                {fb.dislikes && (
                                    <div className="flex items-start gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <span className="text-red-600 font-medium text-xs min-w-[80px] shrink-0">👎 Dislikes:</span>
                                        <p className="text-gray-700 text-xs">{fb.dislikes}</p>
                                    </div>
                                )}

                                {/* Keep */}
                                {fb.keep && (
                                    <div className="flex items-start gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <span className="text-blue-600 font-medium text-xs min-w-[80px] shrink-0">✨ Keep:</span>
                                        <p className="text-gray-700 text-xs">{fb.keep}</p>
                                    </div>
                                )}

                                {/* Change */}
                                {fb.change && (
                                    <div className="flex items-start gap-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                        <span className="text-amber-600 font-medium text-xs min-w-[80px] shrink-0">🔧 Change:</span>
                                        <p className="text-gray-700 text-xs">{fb.change}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default FeedbackStack;
