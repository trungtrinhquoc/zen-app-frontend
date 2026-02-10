import api from './client';

export interface Conversation {
    id: string;
    userId: string;
    title?: string;
    status: string;
    messageCount: number;
    dominantEmotion?: string;
    startedAt: string;
    createdAt: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    contentType: string;
    sequenceNumber: number;
    createdAt: string;
    emotionState?: string;
    energyLevel?: number;
    urgencyLevel?: string;
    detectedThemes?: string[];
    modelUsed?: string;
    promptTokens?: number;
    completionTokens?: number;
    responseTimeMs?: number;
}

export interface ConversationDetail extends Conversation {
    messages: Message[];
}

export interface ConversationListResponse {
    conversations: Conversation[];
    total: number;
    limit: number;
    offset: number;
}

export interface UpdateConversationData {
    title?: string;
    status?: 'active' | 'ended' | 'archived';
}

/**
 * API client cho conversation history
 */
export const historyAPI = {
    /**
     * Lấy danh sách conversations của user
     */
    fetchConversations: async (
        userId: string,
        limit = 20,
        offset = 0
    ): Promise<ConversationListResponse> => {
        const response = await api.get('/conversations', {
            params: { userId, limit, offset },
        });
        return response.data;
    },

    /**
     * Lấy chi tiết conversation với tất cả messages
     */
    fetchConversationDetail: async (
        conversationId: string,
        userId: string
    ): Promise<ConversationDetail> => {
        const response = await api.get(`/conversations/${conversationId}`, {
            params: { userId },
        });
        return response.data;
    },

    /**
     * Xóa conversation
     */
    deleteConversation: async (
        conversationId: string,
        userId: string
    ): Promise<{ message: string }> => {
        const response = await api.delete(`/conversations/${conversationId}`, {
            params: { userId },
        });
        return response.data;
    },

    /**
     * Cập nhật conversation (title, status)
     */
    updateConversation: async (
        conversationId: string,
        userId: string,
        data: UpdateConversationData
    ): Promise<Conversation> => {
        const response = await api.patch(
            `/conversations/${conversationId}`,
            data,
            {
                params: { userId },
            }
        );
        return response.data;
    },
};
