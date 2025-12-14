import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download } from 'lucide-react';

const NewPicsSelection = ({ newImages, onSelect, generating, generateCount = 4 }) => {
    // Download handler for individual images
    const handleDownload = async (imgUrl, index, e) => {
        e.stopPropagation(); // Prevent triggering onSelect
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated_photo_${index + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading image:', err);
        }
    };

    // Download all images
    const handleDownloadAll = async () => {
        for (let i = 0; i < newImages.length; i++) {
            await handleDownload(newImages[i], i, { stopPropagation: () => { } });
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    };

    if (generating) {
        return (
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                    <h3 className="font-bold text-gray-800">Generating New Photos...</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: generateCount }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse flex items-center justify-center"
                        >
                            <div className="text-center text-gray-400">
                                <div className="text-2xl mb-1">✨</div>
                                <span className="text-xs">Creating...</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (newImages.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    New Photo Options
                    <span className="text-sm font-normal text-gray-400">Click to select</span>
                </h3>
                {/* Download All Button */}
                <button
                    onClick={handleDownloadAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                    <Download className="h-4 w-4" />
                    Download All
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((img, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-gray-100 hover:border-purple-400 group relative"
                        onClick={() => onSelect(img)}
                    >
                        <img src={img} alt={`Choice ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors" />

                        {/* Download button - top right */}
                        <button
                            onClick={(e) => handleDownload(img, idx, e)}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-10"
                            title="Download this photo"
                        >
                            <Download className="h-5 w-5 text-purple-600" />
                        </button>

                        <div className="absolute bottom-3 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white px-4 py-2 rounded-full font-bold shadow-lg text-purple-600 text-sm">
                                Select This
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default NewPicsSelection;
