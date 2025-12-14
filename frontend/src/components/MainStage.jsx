import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

const MainStage = ({ image, onImageUpload }) => {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex-1 bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden relative group flex items-center justify-center max-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {image ? (
                <img
                    src={image}
                    alt="Profile"
                    className="max-w-full max-h-[380px] object-contain"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => fileInputRef.current.click()}
                >
                    <Upload className="h-16 w-16 mb-4" />
                    <p className="font-medium">Drop your Tinder pic here</p>
                    <p className="text-sm">or click to upload</p>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0])}
                className="hidden"
                accept="image/*"
            />

            {image && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white/90 px-4 py-2 rounded-full font-medium shadow-lg"
                    >
                        Change Photo
                    </button>
                </div>
            )}
        </div>
    );
};

export default MainStage;
