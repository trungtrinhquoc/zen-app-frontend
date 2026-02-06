import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BreathingExercisePage = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
    const [phaseTime, setPhaseTime] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);

    // Box breathing: 4-4-4-4 pattern
    const breathingPattern = {
        inhale: 4,
        hold: 4,
        exhale: 4,
        pause: 4
    };

    useEffect(() => {
        if (!isActive) return;

        const interval = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });

            setPhaseTime(prev => {
                const nextTime = prev + 1;
                const currentPhaseDuration = breathingPattern[phase];

                if (nextTime >= currentPhaseDuration) {
                    // Move to next phase
                    const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause'];
                    const currentIndex = phases.indexOf(phase);
                    const nextPhase = phases[(currentIndex + 1) % 4];
                    setPhase(nextPhase);

                    // Vibration feedback on phase change
                    if (vibrationEnabled && 'vibrate' in navigator) {
                        navigator.vibrate(100);
                    }

                    return 0;
                }
                return nextTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, phase, vibrationEnabled]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return 'Inhale';
            case 'hold': return 'Hold';
            case 'exhale': return 'Exhale';
            case 'pause': return 'Pause';
        }
    };

    const getPhaseTextVi = () => {
        switch (phase) {
            case 'inhale': return 'Hít vào';
            case 'hold': return 'Giữ';
            case 'exhale': return 'Thở ra';
            case 'pause': return 'Nghỉ';
        }
    };

    const getCircleScale = () => {
        const progress = phaseTime / breathingPattern[phase];
        if (phase === 'inhale') return 0.6 + (progress * 0.4); // 0.6 -> 1.0
        if (phase === 'exhale') return 1.0 - (progress * 0.4); // 1.0 -> 0.6
        return phase === 'hold' ? 1.0 : 0.6;
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
                        <h1 className="font-semibold text-white text-lg">Breathing Exercise</h1>
                    </div>
                </div>

                {/* Exercise Content */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full space-y-12">
                        {/* Timer */}
                        <div className="text-center">
                            <div className="text-white/60 text-sm mb-2">Time Remaining</div>
                            <div className="text-white text-5xl font-light tabular-nums">
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Breathing Circle */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="rounded-full border-4 border-white/30"
                                    style={{
                                        width: '280px',
                                        height: '280px',
                                        transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </div>

                            <div
                                className="rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-purple-500 shadow-2xl flex items-center justify-center"
                                style={{
                                    width: '280px',
                                    height: '280px',
                                    transform: `scale(${getCircleScale()})`,
                                    transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div className="text-center">
                                    <div className="text-white text-3xl font-semibold mb-2">
                                        {getPhaseText()}
                                    </div>
                                    <div className="text-white/80 text-lg">
                                        {getPhaseTextVi()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            {/* Start/Stop Button */}
                            <div className="text-center">
                                {!isActive ? (
                                    <button
                                        onClick={() => setIsActive(true)}
                                        className="btn-primary px-12 py-4 text-lg"
                                    >
                                        Get Started
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsActive(false);
                                            setTimeLeft(60);
                                            setPhaseTime(0);
                                            setPhase('inhale');
                                        }}
                                        className="btn-secondary px-12 py-4 text-lg"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Sound & Vibration Controls */}
                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`p-3 rounded-full glass transition-colors ${soundEnabled ? 'bg-white/20' : 'bg-white/5'}`}
                                >
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        {soundEnabled ? (
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        ) : (
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        )}
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                                    className={`p-3 rounded-full glass transition-colors ${vibrationEnabled ? 'bg-white/20' : 'bg-white/5'}`}
                                >
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="glass rounded-2xl p-6 text-center">
                            <p className="text-white/80 text-sm leading-relaxed">
                                Follow the circle's rhythm. Breathe in as it expands, hold as it stays full, breathe out as it contracts, and pause when it's small.
                            </p>
                            <p className="text-white/60 text-xs mt-3">
                                Box Breathing: 4 seconds each phase
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
