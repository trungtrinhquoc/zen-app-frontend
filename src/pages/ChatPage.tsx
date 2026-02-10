import { useState, useEffect, useRef } from 'react';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { Sidebar } from '../components/chat/Sidebar';
import { useChatStore } from '../store/chatStore';
import { chatAPI, healthAPI } from '../api/client';
import { historyAPI } from '../api/history';
import { Settings, AlertCircle } from 'lucide-react';
import type { Message } from '../types';


export const ChatPage = () => {
    const {
        messages,
        currentConversation,
        isSending,
        addMessage,
        setMessages,
        setSending,
        setCurrentConversation,
        clearMessages,
    } = useChatStore();

    const [isOnline, setIsOnline] = useState(true);
    const hasCheckedGreeting = useRef(false);
    const userId = '25f1e353-566d-4ef2-8927-32c9fddada42'; // Hardcoded for now


    useEffect(() => {
        checkHealth();
        checkGreeting();
    }, []);

    const checkHealth = async () => {
        try {
            await healthAPI.check();
            setIsOnline(true);
        } catch (error) {
            setIsOnline(false);
            console.error('Backend offline:', error);
        }
    };

    const checkGreeting = async () => {
        // Prevent double call in StrictMode
        if (hasCheckedGreeting.current) return;

        // Only get greeting if chat is empty
        if (useChatStore.getState().messages.length === 0) {
            hasCheckedGreeting.current = true;
            try {
                // Hardcoded userId for now found in codebase
                const userId = '25f1e353-566d-4ef2-8927-32c9fddada42';
                const response = await chatAPI.getGreeting(userId, currentConversation?.id);

                if (response.assistantMessage) {
                    addMessage(response.assistantMessage);

                    // Update conversation if needed
                    if (!currentConversation && response.conversationId) {
                        setCurrentConversation({
                            id: response.conversationId,
                            userId,
                            title: 'New Chat',
                            status: 'active',
                            messageCount: 1,
                            startedAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to get greeting:', error);
            }
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

                    // Attach suggestion to assistant message if exists
                    if (metadata.suggestion) {
                        const currentMessages = useChatStore.getState().messages;
                        const updated = currentMessages.map(msg =>
                            msg.id === streamingMessage.id
                                ? { ...msg, suggestion: metadata.suggestion }
                                : msg
                        );
                        useChatStore.setState({ messages: updated });
                        console.log('💡 Suggestion attached:', metadata.suggestion.card_title);
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

    const handleNewChat = () => {
        clearMessages();
        setCurrentConversation(null);
        hasCheckedGreeting.current = false;
        checkGreeting();
    };

    const handleSelectConversation = async (conversationId: string) => {
        if (isSending) return;

        try {
            setSending(true);
            const detail = await historyAPI.fetchConversationDetail(conversationId, userId);

            // Map backend messages to store format
            setMessages(detail.messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                contentType: m.contentType || 'text',
                sequenceNumber: m.sequenceNumber,
                createdAt: m.createdAt,
                emotionState: m.emotionState,
                energyLevel: m.energyLevel,
                urgencyLevel: m.urgencyLevel,
                detectedThemes: m.detectedThemes
            })));

            setCurrentConversation({
                id: detail.id,
                userId: detail.userId,
                title: detail.title,
                status: detail.status,
                messageCount: detail.messageCount,
                startedAt: detail.startedAt,
                createdAt: detail.createdAt,
                dominantEmotion: detail.dominantEmotion
            });

            // Mark greeting as checked since we're loading history
            hasCheckedGreeting.current = true;
        } catch (error) {
            console.error('Failed to load conversation:', error);
            alert('Không thể tải cuộc hội thoại này.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-zen flex relative overflow-hidden">
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

            {/* Sidebar */}
            <Sidebar
                userId={userId}
                currentConversationId={currentConversation?.id}
                onNewChat={handleNewChat}
                onSelectConversation={handleSelectConversation}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10">
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

                        <div className="flex items-center gap-2">
                            {/* Settings Button */}
                            <button
                                className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
                                title="Cài đặt"
                            >
                                <Settings size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        {!isOnline && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200">
                                <AlertCircle size={18} />
                                <span className="text-sm">Backend offline. Please check your connection.</span>
                            </div>
                        )}

                        <MessageList messages={messages} />

                        {isSending && (
                            <div className="flex justify-start mt-4">
                                <div className="bg-zen-purple/60 backdrop-blur-md text-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                        <span className="text-xs text-white/70">Đang suy nghĩ...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-white/10 bg-zen-dark/80 backdrop-blur-md">
                    <div className="max-w-3xl mx-auto px-4 py-3">
                        <ChatInput
                            onSend={handleSend}
                            disabled={isSending || !isOnline}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
