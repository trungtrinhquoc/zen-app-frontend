/**
 * RoutinePage — Module 5: Routine System
 *
 * Flow khi bấm vào step:
 *   1. Modal THỰC HÀNH: hiện hướng dẫn + timer đếm ngược
 *   2. Bấm "Đã hoàn thành" → Modal ĐÁNH GIÁ: chọn sao
 *   3. Bấm "Xác nhận" → gọi API → cập nhật progress
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { routineAPI } from '../api/routineApi';
import type {
    RoutineResponse,
    RoutineDay,
    ActivityResponse,
} from '../types';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
    breathing: '🌬️',
    meditation: '🧘',
    journaling: '✍️',
    listening: '🎵',
    movement: '🚶',
    reflection: '💭',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    breathing: { bg: 'rgba(99,179,237,0.15)', text: '#63b3ed', border: 'rgba(99,179,237,0.4)' },
    meditation: { bg: 'rgba(154,117,234,0.15)', text: '#9a75ea', border: 'rgba(154,117,234,0.4)' },
    journaling: { bg: 'rgba(72,187,120,0.15)', text: '#48bb78', border: 'rgba(72,187,120,0.4)' },
    listening: { bg: 'rgba(246,173,85,0.15)', text: '#f6ad55', border: 'rgba(246,173,85,0.4)' },
    movement: { bg: 'rgba(245,101,101,0.15)', text: '#f56565', border: 'rgba(245,101,101,0.4)' },
    reflection: { bg: 'rgba(104,211,145,0.15)', text: '#68d391', border: 'rgba(104,211,145,0.4)' },
};

const HARDCODED_USER_ID = '25f1e353-566d-4ef2-8927-32c9fddada42';

const EMOTIONS = [
    { value: 'anxious', label: 'Lo âu', emoji: '😰', energy: 3 },
    { value: 'stressed', label: 'Căng thẳng', emoji: '😓', energy: 4 },
    { value: 'sad', label: 'Buồn', emoji: '😔', energy: 2 },
    { value: 'tired', label: 'Mệt mỏi', emoji: '😴', energy: 2 },
    { value: 'overwhelmed', label: 'Quá tải', emoji: '😵', energy: 3 },
    { value: 'calm', label: 'Bình tĩnh', emoji: '😌', energy: 6 },
    { value: 'neutral', label: 'Bình thường', emoji: '😐', energy: 5 },
    { value: 'hopeful', label: 'Hy vọng', emoji: '🌱', energy: 6 },
];

// ─── Pending Step ──────────────────────────────────────────────────────────────
interface PendingStep {
    dayNumber: number;
    stepNumber: number;
    activity: ActivityResponse | undefined;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function RoutinePage() {
    const [routine, setRoutine] = useState<RoutineResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState('neutral');
    const [activeDay, setActiveDay] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Step flow state
    const [pendingStep, setPendingStep] = useState<PendingStep | null>(null);
    const [modalPhase, setModalPhase] = useState<'practice' | 'rating' | null>(null);
    const [ratingStars, setRatingStars] = useState(0);
    const [completingStep, setCompletingStep] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => { loadActiveRoutine(); }, []);

    const loadActiveRoutine = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await routineAPI.getActive(HARDCODED_USER_ID);
            setRoutine(data);
            if (data) setActiveDay(data.currentDay);
        } catch {
            setError('Không thể tải routine. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        const emotionObj = EMOTIONS.find(e => e.value === selectedEmotion);
        try {
            const data = await routineAPI.generate({
                userId: HARDCODED_USER_ID,
                emotion: selectedEmotion,
                energyLevel: emotionObj?.energy ?? 5,
                preferences: {},
            });
            setRoutine(data);
            setActiveDay(1);
        } catch {
            setError('AI đang bận. Vui lòng thử lại sau ít phút.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAbandon = async () => {
        if (!routine) return;
        if (!confirm('Bạn có chắc muốn bỏ routine này không?')) return;
        try {
            await routineAPI.abandon(routine.id, HARDCODED_USER_ID);
            setRoutine(null);
        } catch {
            setError('Không thể bỏ routine. Thử lại nhé.');
        }
    };

    const isStepDone = (dayNumber: number, stepNumber: number) =>
        routine?.completedSteps.includes(`day_${dayNumber}_step_${stepNumber}`) ?? false;

    // Bước 1: Bấm vào step → mở modal THỰC HÀNH
    const handleStepClick = (dayNumber: number, stepNumber: number, activity?: ActivityResponse) => {
        if (isStepDone(dayNumber, stepNumber)) return;
        setPendingStep({ dayNumber, stepNumber, activity });
        setRatingStars(0);
        setModalPhase('practice');
    };

    // Bước 2: Bấm "Đã hoàn thành" trong modal practice → chuyển sang modal ĐÁNH GIÁ
    const handlePracticeComplete = () => {
        setModalPhase('rating');
    };

    // Bước 3: Bấm "Xác nhận" trong modal đánh giá → gọi API
    const handleConfirmStep = async () => {
        if (!routine || !pendingStep) return;
        const key = `${pendingStep.dayNumber}_${pendingStep.stepNumber}`;
        setCompletingStep(key);
        setModalPhase(null);
        try {
            const result = await routineAPI.completeStep(routine.id, {
                userId: HARDCODED_USER_ID,
                dayNumber: pendingStep.dayNumber,
                stepNumber: pendingStep.stepNumber,
                userRating: ratingStars > 0 ? ratingStars : undefined,
            });

            const stepKey = `day_${pendingStep.dayNumber}_step_${pendingStep.stepNumber}`;
            const newCompleted = [...(routine.completedSteps ?? []), stepKey];
            const newProgress = (newCompleted.length / (result.totalSteps || 15)) * 100;

            setRoutine(prev => prev ? {
                ...prev,
                completedSteps: newCompleted,
                progressPercent: Math.round(newProgress * 10) / 10,
                status: result.isRoutineCompleted ? 'completed' : prev.status,
            } : null);

            if (result.isRoutineCompleted) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 5000);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Không thể ghi nhận. Thử lại nhé.');
        } finally {
            setCompletingStep(null);
            setPendingStep(null);
        }
    };

    const closeModal = () => {
        setModalPhase(null);
        setPendingStep(null);
    };

    const currentDay: RoutineDay | undefined = routine?.days.find(d => d.dayNumber === activeDay);

    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
            color: '#e2e8f0',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: '24px 16px',
            position: 'relative',
            overflowX: 'hidden',
        }}>

            {/* ── Back Button ── */}
            <button
                onClick={() => navigate('/chat')}
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 200,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
                    color: '#a0aec0', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a0aec0')}
            >
                ← Quay lại
            </button>

            {/* Celebration overlay */}
            {showCelebration && (
                <div style={{
                    position: 'fixed', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, background: 'rgba(0,0,0,0.8)', flexDirection: 'column', gap: 16,
                }}>
                    <div style={{ fontSize: 72 }}>🎉</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#f6ad55' }}>Routine Hoàn Thành!</div>
                    <div style={{ color: '#a0aec0', fontSize: 16 }}>Bạn thật tuyệt vời! 💪</div>
                </div>
            )}

            {/* ── MODAL 1: THỰC HÀNH ─────────────────────────────────────────── */}
            {modalPhase === 'practice' && pendingStep && (
                <PracticeModal
                    activity={pendingStep.activity}
                    onComplete={handlePracticeComplete}
                    onClose={closeModal}
                />
            )}

            {/* ── MODAL 2: ĐÁNH GIÁ ──────────────────────────────────────────── */}
            {modalPhase === 'rating' && pendingStep && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: 16,
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 24, padding: 32, maxWidth: 400, width: '100%',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                    }}>
                        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>✨</div>
                        <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
                            Xuất sắc!
                        </div>
                        <div style={{ color: '#a0aec0', textAlign: 'center', fontSize: 14, marginBottom: 24 }}>
                            {pendingStep.activity?.name ?? 'Bài tập'} đã hoàn thành.
                            <br />Bạn cảm thấy thế nào?
                        </div>

                        {/* Star rating */}
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>
                                Đánh giá bài tập (không bắt buộc)
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span
                                        key={s}
                                        onClick={() => setRatingStars(s)}
                                        style={{
                                            fontSize: 32, cursor: 'pointer',
                                            filter: s <= ratingStars ? 'none' : 'grayscale(1) opacity(0.35)',
                                            transition: 'all 0.15s',
                                            transform: s <= ratingStars ? 'scale(1.15)' : 'scale(1)',
                                        }}
                                    >⭐</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    flex: 1, padding: '13px 0', borderRadius: 14,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)', color: '#a0aec0',
                                    cursor: 'pointer', fontSize: 14,
                                }}
                            >Hủy</button>
                            <button
                                onClick={handleConfirmStep}
                                style={{
                                    flex: 2, padding: '13px 0', borderRadius: 14,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #48bb78, #38a169)',
                                    color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                                    boxShadow: '0 4px 16px rgba(72,187,120,0.4)',
                                }}
                            >✅ Xác nhận hoàn thành</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PAGE CONTENT ──────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{
                        fontSize: 28, fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, #667eea, #f6ad55)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        ✨ Routine Chăm Sóc Bản Thân
                    </h1>
                    <p style={{ color: '#718096', margin: '8px 0 0', fontSize: 14 }}>
                        Lộ trình 5 ngày được AI cá nhân hóa cho bạn
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(245,101,101,0.15)', border: '1px solid rgba(245,101,101,0.3)',
                        borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                        color: '#fc8181', fontSize: 14, display: 'flex', justifyContent: 'space-between',
                    }}>
                        {error}
                        <span style={{ cursor: 'pointer' }} onClick={() => setError(null)}>✕</span>
                    </div>
                )}

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#718096' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🌀</div>
                        <div>Đang tải routine của bạn...</div>
                    </div>
                ) : !routine ? (
                    <GenerateView
                        selectedEmotion={selectedEmotion}
                        onEmotionChange={setSelectedEmotion}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                ) : (
                    <ActiveRoutineView
                        routine={routine}
                        activeDay={activeDay}
                        currentDay={currentDay}
                        onDayChange={setActiveDay}
                        onStepClick={handleStepClick}
                        onAbandon={handleAbandon}
                        isStepDone={isStepDone}
                        completingStep={completingStep}
                    />
                )}
            </div>
        </div>
    );
}


// ─── MODAL THỰC HÀNH ──────────────────────────────────────────────────────────
function PracticeModal({
    activity,
    onComplete,
    onClose,
}: {
    activity: ActivityResponse | undefined;
    onComplete: () => void;
    onClose: () => void;
}) {
    const defaultMinutes = activity?.durationMinutes ?? 5;

    // Adjustable duration (user can change before starting)
    const [customMinutes, setCustomMinutes] = useState(defaultMinutes);
    const durationSec = customMinutes * 60;

    const [timeLeft, setTimeLeft] = useState(durationSec);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerDone, setTimerDone] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cat = activity?.category ?? 'meditation';
    const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.meditation;
    const catIcon = CAT_ICONS[cat] ?? '🧘';

    const instructions: Array<{ step: number; text: string }> =
        (activity?.instructions as any[])?.length
            ? (activity!.instructions as any[]).map((ins, i) => ({
                step: ins.step ?? (i + 1),
                text: ins.text ?? ins,
            }))
            : getGenericInstructions(cat, customMinutes);

    // Adjust duration — only before timer starts
    const adjustDuration = (delta: number) => {
        if (timerStarted) return;
        const next = Math.min(60, Math.max(1, customMinutes + delta));
        setCustomMinutes(next);
        setTimeLeft(next * 60);
    };

    const startTimer = () => {
        if (timerRunning || timerDone) return;
        setTimerRunning(true);
        setTimerStarted(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setTimerRunning(false);
                    setTimerDone(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');
    const progress = durationSec > 0 ? ((durationSec - timeLeft) / durationSec) * 100 : 0;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16,
        }}>
            <div style={{
                background: 'linear-gradient(155deg, #1a1a2e 0%, #16213e 100%)',
                border: `1px solid ${colors.border}`,
                borderRadius: 28, padding: 32, maxWidth: 460, width: '100%',
                boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 40px ${colors.bg}`,
                maxHeight: '90vh', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26, flexShrink: 0,
                        }}>{catIcon}</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
                                {activity?.name ?? 'Bài tập'}
                            </div>
                            <div style={{ color: colors.text, fontSize: 12, fontWeight: 600, marginTop: 3 }}>
                                {cat}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', color: '#4a5568',
                            fontSize: 20, cursor: 'pointer', lineHeight: 1,
                        }}
                    >✕</button>
                </div>

                {/* Description */}
                {activity?.description && (
                    <p style={{
                        color: '#a0aec0', fontSize: 13, lineHeight: 1.6,
                        background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                        padding: '12px 14px', marginBottom: 20,
                    }}>
                        {activity.description}
                    </p>
                )}

                {/* ── Duration Adjuster ─────────────────────────── */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 16, marginBottom: 16,
                }}>
                    <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>THỜI GIAN</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            onClick={() => adjustDuration(-1)}
                            disabled={timerStarted}
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: `1px solid ${colors.border}`,
                                background: timerStarted ? 'rgba(255,255,255,0.03)' : colors.bg,
                                color: timerStarted ? '#4a5568' : colors.text,
                                fontSize: 18, cursor: timerStarted ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, lineHeight: 1,
                            }}
                        >−</button>
                        <span style={{ fontSize: 22, fontWeight: 800, minWidth: 60, textAlign: 'center' }}>
                            {customMinutes} phút
                        </span>
                        <button
                            onClick={() => adjustDuration(1)}
                            disabled={timerStarted}
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: `1px solid ${colors.border}`,
                                background: timerStarted ? 'rgba(255,255,255,0.03)' : colors.bg,
                                color: timerStarted ? '#4a5568' : colors.text,
                                fontSize: 18, cursor: timerStarted ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, lineHeight: 1,
                            }}
                        >+</button>
                    </div>
                </div>

                {/* Timer */}
                <div style={{
                    textAlign: 'center', marginBottom: 20,
                    background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: '20px 16px',
                }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                        <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={50} cy={50} r={42}
                                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
                            <circle cx={50} cy={50} r={42}
                                fill="none" stroke={colors.text} strokeWidth={6}
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                                {mm}:{ss}
                            </div>
                        </div>
                    </div>

                    {timerDone ? (
                        <div style={{ color: '#68d391', fontWeight: 700, fontSize: 15 }}>
                            🎉 Hết giờ! Tuyệt vời!
                        </div>
                    ) : (
                        <button
                            onClick={startTimer}
                            disabled={timerRunning}
                            style={{
                                padding: '10px 28px', borderRadius: 30,
                                border: `1px solid ${colors.border}`,
                                background: timerRunning ? colors.bg : 'transparent',
                                color: colors.text, cursor: timerRunning ? 'default' : 'pointer',
                                fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                            }}
                        >
                            {timerRunning ? '⏱ Đang chạy...' : '▶ Bắt đầu đếm giờ'}
                        </button>
                    )}
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: '#718096', fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>
                        HƯỚNG DẪN THỰC HIỆN
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {instructions.map((ins) => (
                            <div key={ins.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                    background: colors.bg, border: `1px solid ${colors.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: colors.text, fontSize: 12, fontWeight: 700,
                                }}>
                                    {ins.step}
                                </div>
                                <div style={{ fontSize: 14, color: '#cbd5e0', lineHeight: 1.55, paddingTop: 2 }}>
                                    {ins.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Complete Button (only enabled after timer done) ── */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={timerDone ? onComplete : undefined}
                        disabled={!timerDone}
                        title={!timerDone ? 'Vui lòng chạy hết thời gian trước khi hoàn thành' : ''}
                        style={{
                            width: '100%', padding: '16px 0', borderRadius: 16,
                            border: 'none',
                            background: timerDone
                                ? 'linear-gradient(135deg, #48bb78, #38a169)'
                                : 'rgba(255,255,255,0.06)',
                            color: timerDone ? 'white' : '#4a5568',
                            fontWeight: 700, fontSize: 16,
                            cursor: timerDone ? 'pointer' : 'not-allowed',
                            boxShadow: timerDone ? '0 8px 24px rgba(72,187,120,0.4)' : 'none',
                            transition: 'all 0.3s',
                        }}
                    >
                        {timerDone ? '✅ Đã hoàn thành bài tập' : '⏳ Hãy chạy hết thời gian trước'}
                    </button>
                    {!timerDone && (
                        <div style={{
                            textAlign: 'center', marginTop: 8,
                            fontSize: 12, color: '#718096',
                        }}>
                            Bấm ▶ để bắt đầu đếm giờ, hoàn thành xong mới được ghi nhận
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Generic instructions nếu activity không có instructions */
function getGenericInstructions(
    category: string,
    durationMinutes: number,
): Array<{ step: number; text: string }> {
    const maps: Record<string, string[]> = {
        breathing: [
            'Ngồi thoải mái, lưng thẳng, đặt tay lên đầu gối.',
            'Nhắm mắt lại và hít một hơi thật sâu để thư giãn.',
            `Thực hiện bài thở trong ${durationMinutes} phút theo hướng dẫn.`,
            'Sau khi xong, ngồi yên và chú ý cảm giác cơ thể.',
        ],
        meditation: [
            'Tìm tư thế ngồi hoặc nằm thoải mái.',
            'Nhắm mắt, tập trung vào hơi thở tự nhiên của mình.',
            `Duy trì trong ${durationMinutes} phút, không cần cố gắng kiểm soát suy nghĩ.`,
            'Khi tâm trí đi lang thang, nhẹ nhàng kéo sự chú ý về hơi thở.',
        ],
        journaling: [
            'Chuẩn bị giấy bút hoặc ứng dụng ghi chú.',
            'Hít thở sâu 3 lần để chuẩn bị tâm trạng.',
            `Viết tự do trong ${durationMinutes} phút không cần sửa hoặc đánh giá.`,
            'Đọc lại những gì bạn đã viết và cảm nhận.',
        ],
        listening: [
            'Đeo tai nghe hoặc tìm không gian yên tĩnh.',
            'Điều chỉnh âm lượng vừa phải, thoải mái.',
            `Nhắm mắt và lắng nghe trong ${durationMinutes} phút.`,
            'Để âm thanh dẫn dắt cảm xúc của bạn, không cần suy nghĩ thêm.',
        ],
        movement: [
            'Mặc quần áo thoải mái và giải phóng không gian xung quanh.',
            'Khởi động nhẹ bằng cách vươn vai và xoay cổ.',
            `Thực hiện từng động tác trong ${durationMinutes} phút theo nhịp điệu của bạn.`,
            'Kết thúc với vài hơi thở sâu và thư giãn cơ thể.',
        ],
        reflection: [
            'Tìm không gian yên tĩnh, tắt các thông báo.',
            'Hít thở sâu và chuẩn bị tâm trí cởi mở.',
            `Dành ${durationMinutes} phút quan sát suy nghĩ và cảm xúc mà không phán xét.`,
            'Ghi lại bất kỳ điều gì xuất hiện trong tâm trí nếu muốn.',
        ],
    };
    const steps = maps[category] ?? maps.meditation;
    return steps.map((text, i) => ({ step: i + 1, text }));
}


// ─── Generate View ────────────────────────────────────────────────────────────
function GenerateView({
    selectedEmotion, onEmotionChange, onGenerate, isGenerating
}: {
    selectedEmotion: string;
    onEmotionChange: (e: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}) {
    return (
        <div>
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: 28, marginBottom: 24,
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
                    Bạn đang cảm thấy thế nào?
                </h2>
                <p style={{ color: '#718096', fontSize: 13, margin: '0 0 20px' }}>
                    AI sẽ tạo lộ trình phù hợp với trạng thái của bạn
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {EMOTIONS.map(emotion => (
                        <button
                            key={emotion.value}
                            onClick={() => onEmotionChange(emotion.value)}
                            style={{
                                padding: '14px 8px', borderRadius: 14,
                                border: selectedEmotion === emotion.value
                                    ? '2px solid #667eea'
                                    : '1px solid rgba(255,255,255,0.08)',
                                background: selectedEmotion === emotion.value
                                    ? 'rgba(102,126,234,0.15)'
                                    : 'rgba(255,255,255,0.03)',
                                color: selectedEmotion === emotion.value ? '#667eea' : '#a0aec0',
                                cursor: 'pointer',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: 6, transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ fontSize: 24 }}>{emotion.emoji}</span>
                            <span style={{ fontSize: 11, fontWeight: 500 }}>{emotion.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={isGenerating}
                style={{
                    width: '100%', padding: '18px 0', borderRadius: 16, border: 'none',
                    background: isGenerating
                        ? 'rgba(102,126,234,0.3)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white', fontSize: 17, fontWeight: 700,
                    cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: isGenerating ? 'none' : '0 8px 32px rgba(102,126,234,0.4)',
                }}
            >
                {isGenerating ? <><span>🌀</span>AI đang tạo lộ trình...</> : <>✨ Tạo Routine Cá Nhân Hóa</>}
            </button>
            <p style={{ textAlign: 'center', color: '#4a5568', fontSize: 12, marginTop: 12 }}>
                Mất khoảng 5-10 giây để AI thiết kế lộ trình dành riêng cho bạn
            </p>
        </div>
    );
}


// ─── Active Routine View ──────────────────────────────────────────────────────
function ActiveRoutineView({
    routine, activeDay, currentDay, onDayChange, onStepClick, onAbandon, isStepDone, completingStep
}: {
    routine: RoutineResponse;
    activeDay: number;
    currentDay: RoutineDay | undefined;
    onDayChange: (d: number) => void;
    onStepClick: (day: number, step: number, act?: ActivityResponse) => void;
    onAbandon: () => void;
    isStepDone: (day: number, step: number) => boolean;
    completingStep: string | null;
}) {
    const completedCount = routine.completedSteps.length;
    const totalSteps = routine.days.reduce((acc, d) => acc + d.steps.length, 0);

    return (
        <div>
            {/* Routine Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))',
                border: '1px solid rgba(102,126,234,0.3)',
                borderRadius: 20, padding: 24, marginBottom: 24,
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 11, color: '#9a75ea', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>
                            {routine.theme?.toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{routine.title}</h2>
                        {routine.generationReasoning && (
                            <p style={{ color: '#a0aec0', fontSize: 13, margin: '6px 0 0' }}>
                                {routine.generationReasoning}
                            </p>
                        )}
                    </div>
                    <span style={{
                        background: routine.status === 'completed' ? 'rgba(72,187,120,0.2)' : 'rgba(246,173,85,0.2)',
                        border: `1px solid ${routine.status === 'completed' ? 'rgba(72,187,120,0.4)' : 'rgba(246,173,85,0.4)'}`,
                        color: routine.status === 'completed' ? '#68d391' : '#f6ad55',
                        borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                        {routine.status === 'completed' ? '✅ Hoàn thành' : '🔥 Đang thực hiện'}
                    </span>
                </div>

                {/* Progress */}
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, color: '#a0aec0' }}>{completedCount}/{totalSteps} bài tập</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#667eea' }}>{routine.progressPercent}%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${routine.progressPercent}%`,
                            background: 'linear-gradient(90deg, #667eea, #f6ad55)',
                            borderRadius: 99, transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* Day Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {routine.days.map(day => {
                    const dayDone = day.steps.every(s => isStepDone(day.dayNumber, s.order));
                    return (
                        <button
                            key={day.dayNumber}
                            onClick={() => onDayChange(day.dayNumber)}
                            style={{
                                padding: '10px 18px', borderRadius: 14, flexShrink: 0,
                                border: activeDay === day.dayNumber ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.08)',
                                background: activeDay === day.dayNumber ? 'rgba(102,126,234,0.2)'
                                    : dayDone ? 'rgba(72,187,120,0.1)' : 'rgba(255,255,255,0.03)',
                                color: activeDay === day.dayNumber ? '#667eea' : dayDone ? '#68d391' : '#a0aec0',
                                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            }}
                        >
                            <span>Ngày {day.dayNumber}</span>
                            {dayDone && <span style={{ fontSize: 10 }}>✅</span>}
                        </button>
                    );
                })}
            </div>

            {/* Steps */}
            {currentDay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {currentDay.steps.map((step, idx) => {
                        const done = isStepDone(activeDay, step.order);
                        const busy = completingStep === `${activeDay}_${step.order}`;
                        const cat = step.activity?.category ?? 'meditation';
                        const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.meditation;

                        return (
                            <div
                                key={idx}
                                onClick={() => !done && !busy && onStepClick(activeDay, step.order, step.activity)}
                                style={{
                                    background: done ? 'rgba(72,187,120,0.08)' : 'rgba(255,255,255,0.04)',
                                    border: done ? '1px solid rgba(72,187,120,0.25)' : `1px solid ${colors.border}`,
                                    borderRadius: 16, padding: '20px',
                                    cursor: done ? 'default' : 'pointer',
                                    transition: 'all 0.2s', opacity: busy ? 0.6 : 1,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}
                            >
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                        background: done ? 'rgba(72,187,120,0.2)' : colors.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                                    }}>
                                        {done ? '✅' : CAT_ICONS[cat] ?? '🧘'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                            {busy ? 'Đang ghi nhận...' : (step.activity?.name ?? step.slug)}
                                        </div>
                                        <div style={{ color: '#718096', fontSize: 13, lineHeight: 1.4 }}>
                                            {step.activity?.description
                                                ? step.activity.description.substring(0, 80) + '...'
                                                : step.slug}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                            <span style={{
                                                background: colors.bg, color: colors.text,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                                            }}>{cat}</span>
                                            <span style={{
                                                background: 'rgba(255,255,255,0.05)', color: '#718096',
                                                borderRadius: 20, padding: '2px 10px', fontSize: 11,
                                            }}>⏱ {step.duration ?? step.activity?.durationMinutes ?? 5} phút</span>
                                        </div>
                                    </div>
                                </div>

                                {!done && !busy && (
                                    <div style={{
                                        padding: '8px 14px', borderRadius: 30, marginLeft: 12, flexShrink: 0,
                                        background: colors.bg, border: `1px solid ${colors.border}`,
                                        color: colors.text, fontSize: 12, fontWeight: 600,
                                    }}>
                                        Bắt đầu →
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Abandon */}
            {routine.status === 'active' && (
                <button
                    onClick={onAbandon}
                    style={{
                        width: '100%', marginTop: 28, padding: '12px 0',
                        borderRadius: 12, border: '1px solid rgba(245,101,101,0.2)',
                        background: 'rgba(245,101,101,0.08)', color: '#fc8181',
                        cursor: 'pointer', fontSize: 14,
                    }}
                >
                    Bỏ routine này &amp; tạo lộ trình mới
                </button>
            )}
        </div>
    );
}

export default RoutinePage;
