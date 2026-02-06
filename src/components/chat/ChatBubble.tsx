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
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-slide-up`}>
            <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {message.emotionState && isUser && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs opacity-70">
                        <span>{getEmotionEmoji(message.emotionState)}</span>
                        <span>{message.emotionState}</span>
                        {message.energyLevel && (
                            <span>• Energy: {message.energyLevel}/10</span>
                        )}
                    </div>
                )}

                {message.modelUsed && !isUser && (
                    <div className="text-xs opacity-50 mt-1.5">
                        {message.responseTimeMs && `${(message.responseTimeMs / 1000).toFixed(1)}s`}
                    </div>
                )}
            </div>
        </div>
    );
};