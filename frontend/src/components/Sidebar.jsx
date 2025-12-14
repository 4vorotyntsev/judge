import React from 'react';
import { Key, Image } from 'lucide-react';

const Sidebar = ({
    openRouterKey,
    setOpenRouterKey,
    selectedJudgeCount,
    generateCount,
    setGenerateCount
}) => {
    return (
        <div className="w-72 bg-white p-6 border-r border-gray-200 flex flex-col gap-5 shadow-sm">
            {/* OpenRouter Key */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">OpenRouter Key</label>
                <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="password"
                        value={openRouterKey}
                        onChange={(e) => setOpenRouterKey(e.target.value)}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                        placeholder="sk-or-..."
                    />
                </div>
            </div>

            {/* Settings Section */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">Settings</label>

                {/* Selected Judges Display */}
                <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 text-sm font-medium text-gray-700">
                    <span className="text-pink-500">{selectedJudgeCount}</span> {selectedJudgeCount === 1 ? 'Judge' : 'Judges'} Selected
                </div>

                {/* Generate Count Selector */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Image className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Photos to Generate</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((count) => (
                            <button
                                key={count}
                                onClick={() => setGenerateCount(count)}
                                className={`flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${generateCount === count
                                    ? 'bg-gray-800 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />
        </div>
    );
};

export default Sidebar;
