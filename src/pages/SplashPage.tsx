import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/onboarding');
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-zen flex items-center justify-center relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
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

            {/* Logo */}
            <div className="relative z-10 text-center space-y-6 animate-fade-in">
                <div className="w-40 h-40 mx-auto bg-gradient-primary/20 rounded-[32px] flex items-center justify-center border-4 border-zen-primary/30 backdrop-blur-sm">
                    <div className="text-8xl">🌙</div>
                </div>
                <h1 className="text-6xl font-bold text-white tracking-[0.2em]">Zen</h1>
            </div>
        </div>
    );
};