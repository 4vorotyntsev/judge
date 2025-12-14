import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, Plus, X } from 'lucide-react';

const JudgeCard = ({ persona, isSelected, toggleJudge, idx }) => (
    <motion.div
        key={persona.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected
            ? persona.gender === 'male'
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100'
                : 'border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-100'
            : 'border-gray-100 bg-gray-50 opacity-60 hover:opacity-80'
            }`}
    >
        {/* Selection indicator */}
        {isSelected && (
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${persona.gender === 'male'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                : 'bg-gradient-to-r from-pink-500 to-purple-500'
                }`}>
                <Check className="w-3 h-3 text-white" />
            </div>
        )}

        {/* Top row: Clickable Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
            <button
                onClick={() => toggleJudge(persona.id)}
                className={`relative flex-shrink-0 transition-transform duration-200 hover:scale-105 focus:outline-none ${isSelected ? '' : 'grayscale hover:grayscale-0'}`}
            >
                <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-md object-cover cursor-pointer"
                />
                {isSelected && (
                    <div className={`absolute inset-0 rounded-full ring-2 ring-offset-2 ${persona.gender === 'male' ? 'ring-blue-400' : 'ring-pink-400'
                        }`} />
                )}
                {/* Hover hint */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    {isSelected ? (
                        <X className="w-5 h-5 text-white" />
                    ) : (
                        <Plus className="w-5 h-5 text-white" />
                    )}
                </div>
            </button>

            {/* Name */}
            <h3 className={`font-bold text-base ${isSelected ? 'text-gray-800' : 'text-gray-400'
                }`}>
                {persona.name}
                {persona.isCustom && (
                    <span className="ml-2 text-xs font-normal text-purple-500">(custom)</span>
                )}
            </h3>
        </div>

        {/* Full description */}
        <p className={`text-sm leading-relaxed ${isSelected ? 'text-gray-600' : 'text-gray-400'
            }`}>
            {persona.bio}
        </p>
    </motion.div>
);

const JudgeSelection = ({ personas, selectedJudges, setSelectedJudges, onAddCustomJudge }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customBio, setCustomBio] = useState('');
    const [customGender, setCustomGender] = useState('female');

    const toggleJudge = (judgeId) => {
        if (selectedJudges.includes(judgeId)) {
            setSelectedJudges(selectedJudges.filter(id => id !== judgeId));
        } else {
            setSelectedJudges([...selectedJudges, judgeId]);
        }
    };

    const handleAddCustom = () => {
        if (customName.trim() && customBio.trim()) {
            onAddCustomJudge({
                name: customName.trim(),
                bio: customBio.trim(),
                gender: customGender
            });
            setCustomName('');
            setCustomBio('');
            setCustomGender('female');
            setShowAddModal(false);
        }
    };

    // Separate judges by gender
    const { maleJudges, femaleJudges } = useMemo(() => {
        const sortBySelection = (a, b) => {
            const aSelected = selectedJudges.includes(a.id);
            const bSelected = selectedJudges.includes(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        };

        return {
            maleJudges: [...personas].filter(p => p.gender === 'male').sort(sortBySelection),
            femaleJudges: [...personas].filter(p => p.gender === 'female').sort(sortBySelection)
        };
    }, [personas, selectedJudges]);

    return (
        <>
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Your Judges</h2>
                            <p className="text-sm text-gray-500">
                                {selectedJudges.length} selected
                            </p>
                        </div>
                    </div>
                </div>

                {/* Two-column layout: Male (left) and Female (right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Male Judges Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-200">
                            <span className="text-lg">👨</span>
                            <h3 className="font-bold text-blue-600">Male Judges</h3>
                            <span className="ml-auto text-sm text-gray-500">
                                {maleJudges.filter(p => selectedJudges.includes(p.id)).length}/{maleJudges.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {maleJudges.map((persona, idx) => (
                                <JudgeCard
                                    key={persona.id}
                                    persona={persona}
                                    isSelected={selectedJudges.includes(persona.id)}
                                    toggleJudge={toggleJudge}
                                    idx={idx}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Female Judges Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-pink-200">
                            <span className="text-lg">👩</span>
                            <h3 className="font-bold text-pink-600">Female Judges</h3>
                            <span className="ml-auto text-sm text-gray-500">
                                {femaleJudges.filter(p => selectedJudges.includes(p.id)).length}/{femaleJudges.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {femaleJudges.map((persona, idx) => (
                                <JudgeCard
                                    key={persona.id}
                                    persona={persona}
                                    isSelected={selectedJudges.includes(persona.id)}
                                    toggleJudge={toggleJudge}
                                    idx={idx}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Custom Judge Button - centered below both columns */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: personas.length * 0.05 }}
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 w-full relative p-5 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-purple-400 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[100px] group"
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-pink-400 group-hover:to-purple-500 flex items-center justify-center transition-all duration-300">
                        <Plus className="w-7 h-7 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-medium text-gray-500 group-hover:text-purple-600 transition-colors">
                        Add Custom Judge
                    </span>
                </motion.button>
            </div>

            {/* Add Custom Judge Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Add Custom Judge</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judge Name
                                    </label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g., Fitness Influencer Sarah"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Gender Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCustomGender('male')}
                                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${customGender === 'male'
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span>👨</span> Male
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCustomGender('female')}
                                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${customGender === 'female'
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span>👩</span> Female
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Persona Description
                                    </label>
                                    <textarea
                                        value={customBio}
                                        onChange={(e) => setCustomBio(e.target.value)}
                                        placeholder="Describe this judge's personality, preferences, and what they look for in dating profiles..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleAddCustom}
                                    disabled={!customName.trim() || !customBio.trim()}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    Add Judge
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default JudgeSelection;
