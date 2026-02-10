import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
    onTranscript: (text: string, duration: number) => void;
    disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscript, disabled = false }: VoiceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startTimeRef = useRef<number>(0);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000  // Higher quality for Google STT
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            startTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const duration = (Date.now() - startTimeRef.current) / 1000;
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Transcribe immediately
                await transcribeAudio(audioBlob, duration);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (audioBlob: Blob, duration: number) => {
        setIsTranscribing(true);

        try {
            console.log(`📥 Voice upload: voice.webm, ${audioBlob.size} bytes`);

            // Send to backend for transcription
            const formData = new FormData();
            formData.append('file', audioBlob, 'voice.webm');

            const response = await fetch('http://localhost:8000/api/v1/voice/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            const { text } = data;

            // Handle empty transcription gracefully
            if (!text || text.trim() === '') {
                console.warn('⚠️ Empty transcription received');
                alert('Không nghe rõ giọng nói. Vui lòng:\n• Nói to hơn và rõ ràng hơn\n• Ghi âm ít nhất 2-3 giây\n• Kiểm tra microphone');
                return;
            }

            console.log(`✅ Transcription: "${text}"`);

            // Pass transcribed text to parent
            onTranscript(text, duration);

        } catch (error: any) {
            console.error('❌ Transcription failed:', error);
            alert(`Lỗi chuyển đổi: ${error.message || 'Vui lòng thử lại sau.'}`);
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing || disabled}
            className={`p-3 rounded-full transition-all ${isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isTranscribing
                    ? 'bg-gray-500 cursor-not-allowed'
                    : disabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600'
                }`}
            title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
        >
            {isTranscribing ? (
                <Loader2 size={20} className="text-white animate-spin" />
            ) : isRecording ? (
                <Square size={20} className="text-white" />
            ) : (
                <Mic size={20} className="text-white" />
            )}
        </button>
    );
};
