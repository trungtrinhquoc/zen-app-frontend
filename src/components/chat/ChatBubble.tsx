import type { Message } from '../../types';

interface ChatBubbleProps {
    message: Message;
}

const getEmotionEmoji = (emotion?: string) => {
    const emojiMap: Record<string, string> = {
        happy: '😊', sad: '😢', anxious: '😰', stressed: '😓',
        tired: '😴', calm: '😌', angry: '😠', confused: '😕',
        overwhelmed: '😵', neutral: '😐',
    };
    return emotion ? emojiMap[emotion] || '' : '';
};

export const ChatBubble = ({ message }: ChatBubbleProps) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
            <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {message.emotion_state && isUser && (
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <span>{getEmotionEmoji(message.emotion_state)}</span>
                        <span>{message.emotion_state}</span>
                        {message.energy_level && (
                            <span>• Energy: {message.energy_level}/10</span>
                        )}
                    </div>
                )}

                {message.model_used && !isUser && (
                    <div className="text-xs opacity-50 mt-2">
                        {message.response_time_ms && `${(message.response_time_ms / 1000).toFixed(1)}s`}
                    </div>
                )}
            </div>
        </div>
    );
};