import React from 'react';
import { motion } from 'framer-motion';

const FeedbackCarousel = ({ feedbacks, personas }) => {
    if (feedbacks.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                Waiting for the girls to judge...
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 -mx-2 px-2 hide-scrollbar">
            <motion.div
                className="flex gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {feedbacks.map((fb, idx) => {
                    const persona = personas.find(p => p.id === fb.personaId);
                    const isSwipeRight = fb.content.toLowerCase().includes("yes") || fb.content.toLowerCase().includes("swipe right");

                    return (
                        <motion.div
                            key={fb.personaId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="min-w-[280px] w-[280px] bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <img src={persona?.avatar} alt={persona?.name} className="w-10 h-10 rounded-full bg-gray-100" />
                                <div>
                                    <h4 className="font-bold text-gray-800">{persona?.name}</h4>
                                    <p className="text-xs text-gray-500">{persona?.bio}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[120px] scrollbar-thin">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "{fb.content}"
                                </p>
                            </div>

                            <div className={`mt-auto pt-3 border-t border-gray-100 font-bold flex items-center gap-2 ${isSwipeRight ? 'text-green-500' : 'text-red-500'}`}>
                                {isSwipeRight ? '🔥 Hot' : '❌ Not'}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default FeedbackCarousel;
