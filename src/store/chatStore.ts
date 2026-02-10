import { create } from 'zustand';
import type { Message, Conversation, ActivitySuggestion } from '../types';

interface ChatState {
    currentConversation: Conversation | null;
    messages: Message[];
    isLoading: boolean;
    isSending: boolean;
    currentSuggestion: ActivitySuggestion | null;

    setCurrentConversation: (conversation: Conversation | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setSending: (sending: boolean) => void;
    setSuggestion: (suggestion: ActivitySuggestion | null) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    currentConversation: null,
    messages: [],
    isLoading: false,
    isSending: false,
    currentSuggestion: null,

    setCurrentConversation: (conversation) =>
        set({ currentConversation: conversation }),

    setMessages: (messages) => set({ messages }),

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    clearMessages: () => set({ messages: [] }),

    setLoading: (loading) => set({ isLoading: loading }),

    setSending: (sending) => set({ isSending: sending }),

    setSuggestion: (suggestion) => set({ currentSuggestion: suggestion }),

    clearChat: () =>
        set({
            currentConversation: null,
            messages: [],
            currentSuggestion: null,
        }),
}));
