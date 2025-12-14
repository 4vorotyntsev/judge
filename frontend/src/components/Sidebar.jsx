import React from 'react';
import { Key, Heart, MessageCircle, Image, BarChart3, Sparkles, Loader2 } from 'lucide-react';

const Sidebar = ({
    openRouterKey,
    setOpenRouterKey,
    onAskGirls,
    onCombine,
    onGenerate,
    loading,
    combineLoading,
    generating,
    hasFeedbacks,
    hasSuggestions,
    selectedJudgeCount,
    generateCount,
    setGenerateCount,
    swipeStats,
    round
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

            {/* Action Buttons */}
            <button
                onClick={onAskGirls}
                disabled={loading || !openRouterKey || selectedJudgeCount === 0}
                className="flex items-center justify-center gap-2 w-full p-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                <Heart className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'Asking...' : `Ask ${selectedJudgeCount} ${selectedJudgeCount === 1 ? 'Date' : 'Dates'}`}
            </button>

            <button
                onClick={onCombine}
                disabled={combineLoading || !hasFeedbacks}
                className="flex items-center justify-center gap-2 w-full p-3 bg-white border-2 border-gray-800 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <MessageCircle className="h-5 w-5" />
                {combineLoading ? 'Combining...' : 'Combine Suggestions'}
            </button>

            {/* Generate Photos Button - appears after suggestions are ready */}
            <button
                onClick={onGenerate}
                disabled={generating || !hasSuggestions}
                className={`flex items-center justify-center gap-2 w-full p-3 rounded-xl font-bold transition-all duration-300 ${hasSuggestions
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
                {generating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Sparkles className="h-5 w-5" />
                )}
                {generating ? 'Generating...' : `Generate ${generateCount} Photo${generateCount > 1 ? 's' : ''}`}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Score Board - moved here */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <h3 className="font-bold text-gray-800">Score Board</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Round</span>
                        <span className="font-bold text-purple-600">{round}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Swipe Right</span>
                        <span className="font-bold text-green-600">{swipeStats.yes} / {swipeStats.total}</span>
                    </div>
                    {swipeStats.total > 0 && (
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                                style={{ width: `${(swipeStats.yes / swipeStats.total) * 100}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
