import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const OnboardingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-zen flex items-center justify-center p-8 relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: Math.random() * 0.5 + 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-md w-full space-y-12 animate-fade-in">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-white leading-relaxed">
                        A calm space, just for you
                    </h1>
                </div>

                {/* Illustration */}
                <div className="flex justify-center">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />

                        {/* Main illustration */}
                        <div className="relative w-64 h-64 bg-gradient-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-zen-primary/20">
                            <div className="text-9xl">🧘‍♀️</div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-5">
                    <FeatureItem icon="💬" text="Talk to an AI companion" />
                    <FeatureItem icon="🌸" text="Practice gentle routines" />
                    <FeatureItem icon="🎵" text="Listen to calming sounds" />
                </div>

                {/* CTA Button */}
                <Button onClick={() => navigate('/chat')} size="lg" className="w-full">
                    Get Started
                </Button>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
    <div className="flex items-center gap-4">
        <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-white/90 text-lg">{text}</span>
    </div>
);