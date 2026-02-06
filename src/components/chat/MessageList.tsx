import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { ChatBubble } from './ChatBubble';
import { SuggestionCard } from './SuggestionCard';

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 mx-auto bg-gradient-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-zen-primary/20">
                        <span className="text-4xl">💙</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-white/90 text-xl font-light">
                            I'm here with you.
                        </p>
                        <p className="text-white/70 text-lg font-light">
                            Take your time.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
                {messages.flatMap((message) => {
                    // Only split assistant messages
                    if (message.role === 'assistant' && message.content) {
                        const parts = message.content.split(/\n\n+/).filter(p => p.trim());

                        // If no split (or empty), return original
                        if (parts.length <= 1) {
                            return [
                                <ChatBubble key={message.id} message={message} />,
                                // Render suggestion card if exists
                                message.suggestion && (
                                    <SuggestionCard
                                        key={`${message.id}-suggestion`}
                                        suggestion={message.suggestion}
                                    />
                                )
                            ].filter(Boolean);
                        }

                        // Return multiple bubbles + suggestion at the end
                        const bubbles = parts.map((part, index) => {
                            const isLast = index === parts.length - 1;
                            const splitMessage = {
                                ...message,
                                content: part,
                                // Only show metadata (e.g. response time) on last bubble
                                modelUsed: isLast ? message.modelUsed : undefined,
                                responseTimeMs: isLast ? message.responseTimeMs : undefined
                            };

                            return (
                                <ChatBubble
                                    key={`${message.id}-${index}`}
                                    message={splitMessage}
                                />
                            );
                        });

                        // Add suggestion card after last bubble
                        if (message.suggestion) {
                            bubbles.push(
                                <SuggestionCard
                                    key={`${message.id}-suggestion`}
                                    suggestion={message.suggestion}
                                />
                            );
                        }

                        return bubbles;
                    }

                    // User messages render normally
                    return [<ChatBubble key={message.id} message={message} />];
                })}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="chat-bubble-ai">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>
        </div>
    );
};