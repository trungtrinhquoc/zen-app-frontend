import axios from 'axios';
import type { ChatRequest, ChatResponse, Conversation } from '../types';

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
    sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
        const response = await api.post('/chat/chat', request);
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
