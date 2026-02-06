import axios from 'axios';
import type { ChatRequest, Conversation } from '../types';

// ✅ LOCALHOST - Không cần IP phức tạp
const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('📥 API Response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error(
            '❌ API Error:',
            error.config?.url,
            error.response?.status,
            error.response?.data
        );
        return Promise.reject(error);
    }
);

export const chatAPI = {
    /**
     * Send message with streaming response (real-time text display like ChatGPT)
     * Uses Server-Sent Events (SSE) to receive chunks as they're generated
     */
    sendMessage: async (
        request: ChatRequest,
        onChunk: (chunk: string) => void,
        onMetadata?: (metadata: {
            conversationId: string;
            userMessage: {
                role: string;
                content: string;
                emotionState: string;
                energyLevel: number;
                urgencyLevel: string;
                detectedThemes: string[];
                sequenceNumber: number;
            };
            assistantMessage: {
                role: string;
                content: string;
                modelUsed?: string;
                promptTokens?: number;
                completionTokens?: number;
                responseTimeMs?: number;
                sequenceNumber: number;
            };
            contextUsed: number;
            method: string;
            suggestion?: any;  // NEW: For suggestion cards
        }) => void,
        onError?: (error: string) => void
    ): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep last incomplete line in buffer
                buffer = lines.pop() || '';

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();

                    if (line.startsWith('event: chunk')) {
                        const dataLine = lines[i + 1]?.trim();
                        if (dataLine?.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(dataLine.substring(6));
                                onChunk(data.content);
                            } catch (e) {
                                console.error('Failed to parse chunk:', e);
                            }
                        }
                    } else if (line.startsWith('event: metadata')) {
                        const dataLine = lines[i + 1]?.trim();
                        if (dataLine?.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(dataLine.substring(6));
                                onMetadata?.(data);
                            } catch (e) {
                                console.error('Failed to parse metadata:', e);
                            }
                        }
                    } else if (line.startsWith('event: error')) {
                        const dataLine = lines[i + 1]?.trim();
                        if (dataLine?.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(dataLine.substring(6));
                                onError?.(data.error);
                            } catch (e) {
                                console.error('Failed to parse error:', e);
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('❌ Streaming error:', error);
            onError?.(error.message || 'Streaming failed');
            throw error;
        }
    },

    getGreeting: async (userId: string, conversationId?: string) => {
        const response = await api.post('/chat/greeting', {
            userId,
            conversationId,
            message: 'greeting', // Required by schema
            includeContext: false
        });
        return response.data;
    },

    getConversations: async (limit = 20, offset = 0): Promise<Conversation[]> => {
        const response = await api.get('/chat/conversations', {
            params: { limit, offset },
        });
        return response.data;
    },

    getConversation: async (conversationId: string) => {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
    },
};

export const healthAPI = {
    check: async () => {
        const response = await api.get('/health');
        return response.data;
    },
};

export default api;
