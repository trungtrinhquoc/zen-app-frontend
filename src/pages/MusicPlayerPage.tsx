import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const MusicPlayerPage = () => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration] = useState(180); // 3 minutes
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [showScript, setShowScript] = useState(false);

    // Sample music data
    const currentTrack = {
        title: "Less talk.... more action. / Lo-fi for study, work ( with Rain sounds)",
        artist: "Healing Podcast Studio",
        artwork: "🌧️", // Placeholder - would be image URL
        script: `We are not perfect. We should accept ourselves with all our mistakes and flaws.

Mistakes are how we learn and grow. Imperfections are what make us special and interesting.

The path to true happiness and fulfillment isn't paved with perfection - it's paved with self-acceptance, self-love, and a willingness to embrace all of the messy, imperfect parts of ourselves that make us who we are.

See failure as an opportunity, not the end and as a step on the path, not a stop.`
    };

    useEffect(() => {
        let interval: number;
        if (isPlaying && currentTime < duration) {
            interval = window.setInterval(() => {
                setCurrentTime(prev => Math.min(prev + 1, duration));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTime, duration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(parseInt(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };

    return (
        <div className="h-screen bg-gradient-zen flex flex-col relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.3 + 0.2,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="border-b border-white/10 bg-zen-dark/80 backdrop-blur-md">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <h1 className="font-semibold text-white text-lg">Healing Studio</h1>
                    </div>
                </div>

                {/* Player Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
                        {/* Artwork */}
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                                <div className="text-center space-y-4">
                                    <div className="text-8xl">{currentTrack.artwork}</div>
                                    <div className="text-white/90 px-8">
                                        <p className="text-sm font-light">Rainy night ambience</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Track Info */}
                        <div className="text-center space-y-2">
                            <h2 className="text-white text-xl font-semibold leading-tight">
                                {currentTrack.title}
                            </h2>
                            <p className="text-white/60 text-sm">{currentTrack.artist}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-white/60 text-xs">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <button className="p-3 rounded-full glass hover:bg-white/10 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className="p-5 rounded-full bg-white hover:bg-white/90 transition-all shadow-lg"
                            >
                                {isPlaying ? (
                                    <Pause size={28} className="text-purple-600" />
                                ) : (
                                    <Play size={28} className="text-purple-600 ml-1" />
                                )}
                            </button>

                            <button className="p-3 rounded-full glass hover:bg-white/10 transition-colors">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 18h2V6h-2zm-11.5 0l8.5-6-8.5-6z" />
                                </svg>
                            </button>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-3 max-w-xs mx-auto">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={18} className="text-white/70" />
                                ) : (
                                    <Volume2 size={18} className="text-white/70" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                        </div>

                        {/* Script Toggle */}
                        <div className="text-center">
                            <button
                                onClick={() => setShowScript(!showScript)}
                                className="glass px-6 py-2.5 rounded-full text-white text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                            >
                                <span>Scripts</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showScript ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Script Content */}
                        {showScript && (
                            <div className="glass rounded-2xl p-6 animate-slide-up">
                                <h3 className="text-white font-semibold mb-3">Scripts</h3>
                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                                    {currentTrack.script}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};
