export interface User {
    id: string;
    display_name?: string;
    avatar_url?: string;
    language: string;
    created_at: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    content_type: string;
    sequence_number: number;
    created_at: string;
    emotion_state?: string;
    energy_level?: number;
    urgency_level?: string;
    detected_themes?: string[];
    model_used?: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    response_time_ms?: number;
}

export interface Conversation {
    id: string;
    user_id: string;
    title?: string;
    status: string;
    message_count: number;
    dominant_emotion?: string;
    started_at: string;
    created_at: string;
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    include_context?: boolean;
}

export interface ChatResponse {
    conversation_id: string;
    user_message: Message;
    assistant_message: Message;
    context_used: number;
    suggestion?: ActivitySuggestion;
}

export interface ActivitySuggestion {
    activity_type: string;
    activity_name: string;
    duration: number;
    reason: string;
    description: string;
}
