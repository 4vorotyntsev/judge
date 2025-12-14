import React from 'react';

const ScoreBoard = ({ round, swipeStats }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm w-64 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-gray-800">Score board</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Round:</span>
                    <span className="font-mono font-bold text-xl">{round}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Swipe right:</span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-3xl text-brand">{swipeStats.yes}</span>
                        <span className="text-gray-400 font-bold text-xl">/ 10</span>
                    </div>
                </div>
            </div>

            {/* Progress bar visual */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-brand transition-all duration-500 ease-out"
                    style={{ width: `${(swipeStats.yes / 10) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default ScoreBoard;
