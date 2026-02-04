export interface User {
    id: string;
    displayName?: string;
    avatarUrl?: string;
    language: string;
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

export interface ChatRequest {
    userId: string;  // Required now!
    message: string;
    conversationId?: string;
    includeContext?: boolean;
}

export interface ChatResponse {
    conversationId: string;
    userMessage: Message;
    assistantMessage: Message;
    contextUsed: number;
    suggestion?: ActivitySuggestion;
}

export interface ActivitySuggestion {
    activityType: string;
    activityName: string;
    duration: number;
    reason: string;
    description: string;
}
