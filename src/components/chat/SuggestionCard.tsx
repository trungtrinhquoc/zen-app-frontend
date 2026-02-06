import { useNavigate } from 'react-router-dom';
import type { ActivitySuggestion } from '../../types';

interface SuggestionCardProps {
    suggestion: ActivitySuggestion;
}

const gradientStyles: Record<string, string> = {
    'gradient-pink-purple': 'bg-gradient-to-br from-pink-400 via-purple-400 to-purple-500',
    'gradient-purple-blue': 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500',
    'gradient-purple-pink': 'bg-gradient-to-br from-purple-400 via-pink-400 to-pink-500',
    'gradient-dark-blue': 'bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800',
    'gradient-soft-blue': 'bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-300',
};

export const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(suggestion.route_path);
    };

    const gradientClass = gradientStyles[suggestion.visual_style] || gradientStyles['gradient-purple-blue'];

    return (
        <div className="flex justify-start mb-3 animate-slide-up">
            <div className="max-w-[85%]">
                <div
                    className={`${gradientClass} rounded-2xl p-5 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                    onClick={handleClick}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{suggestion.icon}</div>
                        <h3 className="text-white font-semibold text-lg flex-1">
                            {suggestion.card_title}
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                        {suggestion.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="text-white text-xs font-medium">
                                {suggestion.duration} {suggestion.duration === 1 ? 'minute' : 'minutes'}
                            </span>
                        </div>

                        <button className="bg-white/90 hover:bg-white text-purple-700 font-medium px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5">
                            {suggestion.action_text}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
