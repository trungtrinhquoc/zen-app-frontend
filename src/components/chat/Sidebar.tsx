import React, { useState } from 'react';
import { historyAPI, type Conversation } from '../../api/history';
import { Menu, X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    userId: string;
    currentConversationId?: string;
    onNewChat: () => void;
    onSelectConversation: (conversationId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    userId,
    currentConversationId,
    onNewChat,
    onSelectConversation,
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        loadConversations();
    }, [userId]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await historyAPI.fetchConversations(userId, 50, 0);
            setConversations(response.conversations);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Xóa cuộc hội thoại này?')) {
            try {
                await historyAPI.deleteConversation(conversationId, userId);
                loadConversations();
            } catch (err) {
                console.error('Failed to delete:', err);
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (!isOpen) {
        return (
            <button className="sidebar-toggle" onClick={() => setIsOpen(true)}>
                <Menu size={20} />
            </button>
        );
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={onNewChat}>
                    <Plus size={18} />
                    <span>Chat mới</span>
                </button>
                <button className="sidebar-close" onClick={() => setIsOpen(false)}>
                    <X size={20} />
                </button>
            </div>

            <div className="sidebar-content">
                {loading ? (
                    <div className="sidebar-loading">
                        <div className="spinner-small"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="sidebar-empty">
                        <MessageSquare size={32} opacity={0.3} />
                        <p>Chưa có lịch sử</p>
                    </div>
                ) : (
                    <div className="conversation-list-sidebar">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <div className="conversation-item-content">
                                    <div className="conversation-item-title">
                                        <MessageSquare size={16} />
                                        <span>{conv.title || 'Cuộc trò chuyện'}</span>
                                    </div>
                                    <div className="conversation-item-meta">
                                        <span className="conversation-item-date">{formatDate(conv.startedAt)}</span>
                                        <span className="conversation-item-count">{conv.messageCount} tin</span>
                                    </div>
                                </div>
                                <button
                                    className="conversation-item-delete"
                                    onClick={(e) => handleDelete(conv.id, e)}
                                    title="Xóa"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
