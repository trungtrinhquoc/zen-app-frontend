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
    suggestion?: ActivitySuggestion;  // NEW: For suggestion cards
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
    // Voice metadata
    isVoiceInput?: boolean;
    voiceDuration?: number;
}

export interface ChatResponse {
    conversationId: string;
    userMessage: Message;
    assistantMessage: Message;
    contextUsed: number;
    suggestion?: ActivitySuggestion;
}

export interface ActivitySuggestion {
    activity_type: string;
    name: string;
    card_title: string;
    description: string;
    duration: number;
    icon: string;
    visual_style: string;
    action_text: string;
    route_path: string;
}


// ============================================================
// ROUTINE SYSTEM TYPES (Module 5)
// ============================================================

/** Hướng dẫn 1 bước trong activity */
export interface ActivityInstruction {
    step: number;
    text: string;
    duration?: number; // seconds (optional)
}

/** 1 bài tập trong thư viện */
export interface ActivityResponse {

    id: string;
    name: string;
    slug: string;
    category: 'breathing' | 'meditation' | 'journaling' | 'listening' | 'movement' | 'reflection';
    description: string;
    instructions: ActivityInstruction[];
    durationMinutes: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    hasAudio: boolean;
    audioUrl?: string;
    tags: string[];
    bestForEmotions: string[];
    bestForEnergyLevel: number[];
    totalCompletions: number;
    isPremium: boolean;
}

/** Response cho danh sách activities */
export interface ActivityListResponse {
    activities: ActivityResponse[];
    total: number;
    category?: string;
}

/** 1 step trong kế hoạch ngày */
export interface RoutinePlanStep {
    activityId?: string;
    slug: string;
    order: number;
    duration?: number;
    activity?: ActivityResponse;  // Resolved activity details
}

/** 1 ngày trong routine (3 steps) */
export interface RoutineDay {
    dayNumber: number;
    steps: RoutinePlanStep[];
}

/** Full routine response */
export interface RoutineResponse {
    id: string;
    userId: string;
    title: string;
    theme?: string;
    days: RoutineDay[];
    status: 'active' | 'completed' | 'abandoned';
    currentDay: number;
    generatedForEmotion?: string;
    generatedForEnergy?: number;
    generationReasoning?: string;
    completedSteps: string[];  // ["day_1_step_1", "day_1_step_2", ...]
    progressPercent: number;
    startedAt: string;
    completedAt?: string;
    createdAt: string;
}

/** Response cho danh sách routines */
export interface RoutineListResponse {
    routines: RoutineResponse[];
    total: number;
    limit: number;
    offset: number;
}

/** Request tạo routine mới */
export interface GenerateRoutineRequest {
    userId: string;
    emotion: string;
    energyLevel: number;
    preferences?: Record<string, any>;
}

/** Request hoàn thành 1 step */
export interface CompleteStepRequest {
    userId: string;
    dayNumber: number;
    stepNumber: number;
    actualDurationMinutes?: number;
    emotionBefore?: string;
    emotionAfter?: string;
    energyBefore?: number;
    energyAfter?: number;
    userRating?: number;
    userNotes?: string;
}

/** Response sau khi hoàn thành step */
export interface CompleteStepResult {
    success: boolean;
    completionId: string;
    isRoutineCompleted: boolean;
    totalCompleted: number;
    totalSteps: number;
    nextDay?: number;
}

/** Response sau khi abandon routine */
export interface AbandonRoutineResult {
    success: boolean;
    message: string;
}
