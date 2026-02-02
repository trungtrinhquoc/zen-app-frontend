import { useState, useEffect } from 'react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { useChatStore } from '../store/chatStore';
import { chatAPI, healthAPI } from '../api/client';
import { Settings, AlertCircle } from 'lucide-react';

export const ChatPage = () => {
    const {
        messages,
        currentConversation,
        isSending,
        currentSuggestion,
        addMessage,
        setSending,
        setCurrentConversation,
        setSuggestion,
    } = useChatStore();

    const [isOnline, setIsOnline] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(false);

    useEffect(() => {
        checkHealth();
    }, []);

    useEffect(() => {
        if (currentSuggestion) {
            setShowSuggestion(true);
        }
    }, [currentSuggestion]);

    const checkHealth = async () => {
        try {
            await healthAPI.check();
            setIsOnline(true);
        } catch (error) {
            setIsOnline(false);
            console.error('Backend offline:', error);
        }
    };

    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || isSending) return;

        setSending(true);

        try {
            const response = await chatAPI.sendMessage({
                message: messageText,
                conversation_id: currentConversation?.id,
                include_context: true,
            });

            if (!currentConversation) {
                setCurrentConversation({
                    id: response.conversation_id,
                    user_id: '25f1e353-566d-4ef2-8927-32c9fddada42',
                    title: 'New Chat',
                    status: 'active',
                    message_count: 2,
                    started_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                });
            }

            addMessage(response.user_message);
            addMessage(response.assistant_message);

            if (response.suggestion) {
                setSuggestion(response.suggestion);
            }
        } catch (error: any) {
            console.error('Send error:', error);

            if (!isOnline) {
                alert('Backend is offline. Please start backend server:\nuvicorn app.main:app --reload --host 0.0.0.0 --port 8000');
            } else {
                alert(error.response?.data?.detail || 'Failed to send message');
            }
        } finally {
            setSending(false);
        }
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
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">🌙</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-white text-lg">Zen</h1>
                                <div className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-gray-400">{isOnline ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>

                        <button className="p-3 rounded-full glass hover:bg-white/10 transition-colors">
                            <Settings size={20} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Offline Warning */}
                {!isOnline && (
                    <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 backdrop-blur-sm">
                        <div className="max-w-4xl mx-auto flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={16} />
                            <span>Backend offline. Start: <code className="bg-black/30 px-2 py-1 rounded">uvicorn app.main:app --reload</code></span>
                            <button onClick={checkHealth} className="ml-auto text-red-300 hover:text-red-200 underline text-xs">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                    <MessageList messages={messages} isLoading={isSending} />
                </div>

                {/* Suggestion Modal */}
                {showSuggestion && currentSuggestion && (
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowSuggestion(false)}
                    >
                        <div
                            className="glass rounded-3xl p-8 max-w-md w-full space-y-6 animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-4">
                                <div className="text-5xl">💡</div>
                                <h3 className="text-2xl font-semibold text-white">
                                    {currentSuggestion.activity_name}
                                </h3>
                                <p className="text-gray-300">{currentSuggestion.reason}</p>
                                <p className="text-gray-400 text-sm">{currentSuggestion.description}</p>
                                <div className="inline-block bg-zen-primary/20 px-4 py-2 rounded-full">
                                    <span className="text-zen-primary font-medium">
                                        {currentSuggestion.duration} minutes
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSuggestion(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Maybe later
                                </button>
                                <button
                                    onClick={() => setShowSuggestion(false)}
                                    className="flex-1 btn-primary"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input */}
                <ChatInput onSend={handleSend} disabled={isSending || !isOnline} />
            </div>
        </div>
    );
};