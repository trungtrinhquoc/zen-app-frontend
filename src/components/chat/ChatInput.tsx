import { useState, type KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Mic, Plus } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-white/10 bg-zen-dark/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex items-end gap-3">
                    {/* Add button */}
                    <button
                        className="p-3 rounded-full glass hover:bg-white/10 transition-colors flex-shrink-0"
                        disabled={disabled}
                    >
                        <Plus size={24} className="text-zen-primary" />
                    </button>

                    {/* Input area */}
                    <div className="flex-1 glass rounded-3xl flex items-end overflow-hidden">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type here..."
                            disabled={disabled}
                            rows={1}
                            className="flex-1 bg-transparent px-5 py-3.5 text-white placeholder-gray-500 resize-none focus:outline-none max-h-32 min-h-[48px]"
                        />

                        {/* Mic button */}
                        <button
                            className="p-3 hover:bg-white/5 transition-colors flex-shrink-0"
                            disabled={disabled}
                        >
                            <Mic size={20} className="text-zen-primary" />
                        </button>
                    </div>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || disabled}
                        className="p-4 bg-gradient-primary rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};