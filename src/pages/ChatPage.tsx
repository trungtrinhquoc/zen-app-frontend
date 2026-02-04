import { useState, useEffect } from 'react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { useChatStore } from '../store/chatStore';
import { chatAPI, healthAPI } from '../api/client';
import { Settings, AlertCircle } from 'lucide-react';
import type { Message } from '../types';

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

        // ✅ TẠO OPTIMISTIC USER MESSAGE
        const optimisticUserMessage: Message = {
            id: `optimistic-${Date.now()}`,
            role: 'user',
            content: messageText,
            contentType: 'text',
            sequenceNumber: messages.length + 1,
            createdAt: new Date().toISOString(),
        };

        // ✅ HIỂN THỊ NGAY LẬP TỨC
        addMessage(optimisticUserMessage);

        // ✅ TẠO STREAMING ASSISTANT MESSAGE (bắt đầu rỗng)
        const streamingMessage: Message = {
            id: `streaming-${Date.now()}`,
            role: 'assistant',
            content: '', // ← Bắt đầu rỗng, sẽ thêm chunks vào
            contentType: 'text',
            sequenceNumber: messages.length + 2,
            createdAt: new Date().toISOString(),
        };

        addMessage(streamingMessage);
        setSending(true);

        try {
            const startTime = performance.now();
            console.log('🚀 Sending message with streaming...');

            // ✅ CALL STREAMING API
            await chatAPI.sendMessage(
                {
                    userId: '25f1e353-566d-4ef2-8927-32c9fddada42',
                    message: messageText,
                    conversationId: currentConversation?.id,
                    includeContext: true,
                },
                // onChunk: Nhận từng chữ và cập nhật UI ngay lập tức
                (chunk: string) => {
                    const currentMessages = useChatStore.getState().messages;
                    const updated = currentMessages.map(msg =>
                        msg.id === streamingMessage.id
                            ? { ...msg, content: msg.content + chunk } // ← Thêm chunk vào
                            : msg
                    );
                    useChatStore.setState({ messages: updated });
                },
                // onMetadata: Nhận emotion + conversationId khi hoàn thành
                (metadata) => {
                    console.log('📊 Metadata received:', metadata);

                    if (!currentConversation) {
                        setCurrentConversation({
                            id: metadata.conversationId,
                            userId: '25f1e353-566d-4ef2-8927-32c9fddada42',
                            title: 'New Chat',
                            status: 'active',
                            messageCount: 2,
                            startedAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                        });
                    }

                    const endTime = performance.now();
                    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
                    console.log(`⏱️ Total streaming time: ${totalTime}s`);
                    console.log(`🎭 Emotion: ${metadata.userMessage.emotionState}, Energy: ${metadata.userMessage.energyLevel}`);
                    console.log(`📊 Context: ${metadata.contextUsed} messages`);
                    console.log(`🤖 Model: ${metadata.assistantMessage.modelUsed || 'N/A'}`);
                    if (metadata.assistantMessage.promptTokens) {
                        console.log(`🎫 Tokens: ${metadata.assistantMessage.completionTokens} completion + ${metadata.assistantMessage.promptTokens} prompt`);
                    }
                },
                // onError: Xử lý lỗi
                (error: string) => {
                    console.error('❌ Streaming error:', error);

                    // Remove streaming message nếu lỗi
                    const currentMessages = useChatStore.getState().messages;
                    const filtered = currentMessages.filter(m => m.id !== streamingMessage.id);
                    useChatStore.setState({ messages: filtered });

                    alert(`Streaming error: ${error}`);
                }
            );

        } catch (error: any) {
            console.error('❌ Send error:', error);

            // ✅ REMOVE cả 2 optimistic messages nếu lỗi
            const currentMessages = useChatStore.getState().messages;
            const filteredMessages = currentMessages.filter(
                m => m.id !== optimisticUserMessage.id && m.id !== streamingMessage.id
            );
            useChatStore.setState({ messages: filteredMessages });

            if (!isOnline) {
                alert('Backend is offline. Please start backend server:\nuvicorn app.main:app --reload --host 0.0.0.0 --port 8000');
            } else {
                alert(error.message || 'Failed to send message');
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
                    <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center">
                                <span className="text-xl">🌙</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-white text-base">Zen</h1>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-gray-400">{isOnline ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>

                        <button className="p-2 rounded-full glass hover:bg-white/10 transition-colors">
                            <Settings size={18} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Offline Warning */}
                {!isOnline && (
                    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 backdrop-blur-sm">
                        <div className="max-w-3xl mx-auto flex items-center gap-2 text-red-400 text-xs">
                            <AlertCircle size={14} />
                            <span>Backend offline. Start: <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">uvicorn app.main:app --reload</code></span>
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
                            className="glass rounded-2xl p-6 max-w-sm w-full space-y-4 animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-3">
                                <div className="text-4xl">💡</div>
                                <h3 className="text-xl font-semibold text-white">
                                    {currentSuggestion.activityName}
                                </h3>
                                <p className="text-gray-300 text-sm">{currentSuggestion.reason}</p>
                                <p className="text-gray-400 text-xs">{currentSuggestion.description}</p>
                                <div className="inline-block bg-zen-primary/20 px-3 py-1.5 rounded-full">
                                    <span className="text-zen-primary font-medium text-sm">
                                        {currentSuggestion.duration} minutes
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSuggestion(false)}
                                    className="flex-1 btn-secondary text-sm"
                                >
                                    Maybe later
                                </button>
                                <button
                                    onClick={() => setShowSuggestion(false)}
                                    className="flex-1 btn-primary text-sm"
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