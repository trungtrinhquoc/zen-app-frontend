/**
 * Routine API Client
 * Tất cả API calls cho Module 5 - Routine System
 * 
 * Base URL: http://localhost:8000/api/v1
 * 
 * Giải thích:
 * - Dùng axios instance từ client.ts (đã có interceptors)
 * - Tất cả types được import từ '../types'
 * - Mỗi function là 1 API call hoàn chỉnh với error handling
 */
import api from './client';
import type {
    ActivityResponse,
    ActivityListResponse,
    RoutineResponse,
    RoutineListResponse,
    GenerateRoutineRequest,
    CompleteStepRequest,
    CompleteStepResult,
    AbandonRoutineResult,
} from '../types';


// ============================================================
// ACTIVITY LIBRARY
// ============================================================

export const activityAPI = {
    /**
     * Lấy danh sách activities với optional filters
     * GET /routines/activities
     */
    getAll: async (params?: {
        category?: string;
        emotion?: string;
        energyLevel?: number;
        limit?: number;
        offset?: number;
    }): Promise<ActivityListResponse> => {
        const queryParams: Record<string, any> = {};
        if (params?.category) queryParams.category = params.category;
        if (params?.emotion) queryParams.emotion = params.emotion;
        if (params?.energyLevel !== undefined) queryParams.energy_level = params.energyLevel;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.offset !== undefined) queryParams.offset = params.offset;

        const response = await api.get('/routines/activities', { params: queryParams });
        return response.data;
    },
};


// ============================================================
// ROUTINE MANAGEMENT
// ============================================================

export const routineAPI = {
    /**
     * Tạo routine 5 ngày mới bằng AI
     * POST /routines/generate
     * 
     * Nếu đã có active routine → trả về routine hiện tại (backend tự kiểm tra)
     */
    generate: async (request: GenerateRoutineRequest): Promise<RoutineResponse> => {
        const response = await api.post('/routines/generate', {
            userId: request.userId,
            emotion: request.emotion,
            energyLevel: request.energyLevel,
            preferences: request.preferences ?? {},
        });
        return response.data;
    },

    /**
     * Lấy routine đang active
     * GET /routines/active?userId=...
     * 
     * Returns null nếu không có active routine
     */
    getActive: async (userId: string): Promise<RoutineResponse | null> => {
        const response = await api.get('/routines/active', {
            params: { userId },
        });
        return response.data;
    },

    /**
     * Lấy lịch sử routines (completed + abandoned)
     * GET /routines/history?userId=...
     */
    getHistory: async (
        userId: string,
        limit = 10,
        offset = 0
    ): Promise<RoutineListResponse> => {
        const response = await api.get('/routines/history', {
            params: { userId, limit, offset },
        });
        return response.data;
    },

    /**
     * Đánh dấu 1 step hoàn thành
     * POST /routines/{id}/complete-step
     */
    completeStep: async (
        routineId: string,
        request: CompleteStepRequest
    ): Promise<CompleteStepResult> => {
        const response = await api.post(`/routines/${routineId}/complete-step`, {
            userId: request.userId,
            dayNumber: request.dayNumber,
            stepNumber: request.stepNumber,
            actualDurationMinutes: request.actualDurationMinutes,
            emotionBefore: request.emotionBefore,
            emotionAfter: request.emotionAfter,
            energyBefore: request.energyBefore,
            energyAfter: request.energyAfter,
            userRating: request.userRating,
            userNotes: request.userNotes,
        });
        return response.data;
    },

    /**
     * Bỏ routine đang active
     * POST /routines/{id}/abandon
     */
    abandon: async (
        routineId: string,
        userId: string
    ): Promise<AbandonRoutineResult> => {
        const response = await api.post(`/routines/${routineId}/abandon`, {
            userId,
        });
        return response.data;
    },
};
