import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

interface RoutineStep {
    stepNumber: number;
    title: string;
    titleVi: string;
    description: string;
    descriptionVi: string;
    duration: number;
    icon: string;
    activityType: 'breathing' | 'meditation' | 'journaling' | 'listening';
}

const SAMPLE_ROUTINE: RoutineStep[] = [
    {
        stepNumber: 1,
        title: 'Settle',
        titleVi: 'Ổn định',
        description: 'A gentle start to help you feel safe, calm, and present in the moment.',
        descriptionVi: 'Bắt đầu nhẹ nhàng để bạn cảm thấy an toàn, bình tĩnh và hiện diện.',
        duration: 3,
        icon: '🌸',
        activityType: 'breathing'
    },
    {
        stepNumber: 2,
        title: 'Release',
        titleVi: 'Giải tỏa',
        description: 'Understand the tension you carry. Breathe it out gently.',
        descriptionVi: 'Hiểu căng thẳng bạn đang mang. Thở ra nhẹ nhàng.',
        duration: 5,
        icon: '🌊',
        activityType: 'breathing'
    },
    {
        stepNumber: 3,
        title: 'Ground',
        titleVi: 'Kết nối',
        description: 'Reconnect with your body. Notice what you feel without judgment.',
        descriptionVi: 'Kết nối lại với cơ thể. Nhận biết cảm giác mà không phán xét.',
        duration: 5,
        icon: '📝',
        activityType: 'meditation'
    },
    {
        stepNumber: 4,
        title: 'Listen',
        titleVi: 'Lắng nghe',
        description: 'Gentle reassurance through calming sounds or a short audio.',
        descriptionVi: 'An ủi nhẹ nhàng qua âm thanh êm dịu hoặc audio ngắn.',
        duration: 7,
        icon: '🎧',
        activityType: 'listening'
    },
    {
        stepNumber: 5,
        title: 'Close & Connect',
        titleVi: 'Kết thúc & Kết nối',
        description: 'A peaceful close to carry calm towards your next steps.',
        descriptionVi: 'Kết thúc bình yên để mang sự bình tĩnh vào bước tiếp theo.',
        duration: 3,
        icon: '💙',
        activityType: 'meditation'
    }
];

export const RoutinePage = () => {
    const navigate = useNavigate();
    const { routineId } = useParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Timer states - MUST be at top level for Hooks rules
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const routine = {
        title: 'Healing Routine',
        titleVi: 'Liệu trình chữa lành',
        description: 'Each day is a full reset, super curated gently for you.',
        descriptionVi: 'Mỗi ngày là một khởi đầu mới, được thiết kế nhẹ nhàng cho bạn.',
        totalDuration: SAMPLE_ROUTINE.reduce((sum, step) => sum + step.duration, 0),
        steps: SAMPLE_ROUTINE
    };

    const currentStepData = routine.steps[currentStep];

    // Timer effect
    useEffect(() => {
        if (!isTimerActive || timeLeft <= 0) return;

        const interval = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsTimerActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft]);

    // Reset timer when step changes
    useEffect(() => {
        setTimeLeft(currentStepData.duration * 60);
        setIsTimerActive(false);
    }, [currentStep, currentStepData.duration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStepComplete = () => {
        setCompletedSteps([...completedSteps, currentStep]);
        if (currentStep < routine.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Routine complete
            navigate('/chat');
        }
    };

    const handleStepStart = (stepIndex: number) => {
        setCurrentStep(stepIndex);
        setIsStarted(true);
    };

    if (!isStarted) {
        // Overview screen
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
                            <h1 className="font-semibold text-white text-lg">{routine.titleVi}</h1>
                        </div>
                    </div>

                    {/* Routine Overview */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
                            {/* Header */}
                            <div className="text-center space-y-3">
                                <div className="text-6xl mb-4">🌸</div>
                                <h2 className="text-white text-2xl font-semibold">{routine.titleVi}</h2>
                                <p className="text-white/70 text-sm max-w-md mx-auto">
                                    {routine.descriptionVi}
                                </p>
                                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <span className="text-white/90 text-sm">
                                        {routine.totalDuration} phút • {routine.steps.length} bước
                                    </span>
                                </div>
                            </div>

                            {/* Steps List */}
                            <div className="space-y-4">
                                {routine.steps.map((step, index) => (
                                    <div
                                        key={step.stepNumber}
                                        className="glass rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer"
                                        onClick={() => handleStepStart(index)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                                                    {step.icon}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-white font-semibold">
                                                        ✨ Day {step.stepNumber}: {step.titleVi}
                                                    </h3>
                                                </div>
                                                <p className="text-white/70 text-sm mb-2">
                                                    {step.descriptionVi}
                                                </p>
                                                <div className="flex items-center gap-2 text-white/50 text-xs">
                                                    <span>{step.duration} phút</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{step.activityType}</span>
                                                </div>
                                            </div>
                                            {completedSteps.includes(index) && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Start Button */}
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => handleStepStart(0)}
                                    className="btn-primary px-12 py-4 text-lg"
                                >
                                    Get Started
                                </button>
                                <p className="text-white/50 text-xs mt-3">
                                    Ignore 30 days when today's complete.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step execution screen
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
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setIsStarted(false)}
                            className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div className="text-white/70 text-sm">
                            Step {currentStep + 1} of {routine.steps.length}
                        </div>
                        <div className="w-10" /> {/* Spacer */}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="text-7xl mb-6">{currentStepData.icon}</div>

                        <div className="space-y-3">
                            <h2 className="text-white text-3xl font-semibold">
                                {currentStepData.titleVi}
                            </h2>
                            <p className="text-white/70 text-lg leading-relaxed">
                                {currentStepData.descriptionVi}
                            </p>
                        </div>

                        {/* Timer Display */}
                        <div className="glass rounded-2xl p-8">
                            <div className="text-white/60 text-sm mb-3">Time Remaining</div>
                            <div className="text-white text-6xl font-light tabular-nums mb-4">
                                {formatTime(timeLeft)}
                            </div>

                            {/* Timer Controls */}
                            <div className="flex gap-3 justify-center">
                                {!isTimerActive ? (
                                    <button
                                        onClick={() => setIsTimerActive(true)}
                                        className="btn-primary px-8 py-3"
                                        disabled={timeLeft === 0}
                                    >
                                        {timeLeft === 0 ? 'Time\'s Up!' : 'Start'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsTimerActive(false)}
                                        className="btn-secondary px-8 py-3"
                                    >
                                        Pause
                                    </button>
                                )}

                                {timeLeft !== currentStepData.duration * 60 && (
                                    <button
                                        onClick={() => {
                                            setTimeLeft(currentStepData.duration * 60);
                                            setIsTimerActive(false);
                                        }}
                                        className="btn-secondary px-6 py-3"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleStepComplete}
                                className="btn-primary w-full py-4 text-lg"
                            >
                                {currentStep === routine.steps.length - 1 ? 'Complete Routine' : 'Next Step →'}
                            </button>
                            <button
                                onClick={() => setIsStarted(false)}
                                className="btn-secondary w-full py-3"
                            >
                                Back to Overview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
