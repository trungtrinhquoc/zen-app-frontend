import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export const JournalingPage = () => {
    const navigate = useNavigate();
    const [journalEntry, setJournalEntry] = useState('');
    const [savedEntries, setSavedEntries] = useState<Array<{ id: string, content: string, date: string }>>([]);

    const handleSave = () => {
        if (journalEntry.trim()) {
            const newEntry = {
                id: Date.now().toString(),
                content: journalEntry,
                date: new Date().toLocaleString('vi-VN')
            };
            setSavedEntries([newEntry, ...savedEntries]);
            setJournalEntry('');
        }
    };

    const handleDelete = (id: string) => {
        setSavedEntries(savedEntries.filter(entry => entry.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>

                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Viết nhật ký</h1>
                    <p className="text-gray-600">Viết ra những gì bạn đang nghĩ và cảm nhận</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Writing Area */}
                <div className="bg-white rounded-3xl shadow-lg p-8">
                    <textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="Hôm nay bạn cảm thấy thế nào? Hãy viết ra những suy nghĩ của bạn..."
                        className="w-full h-64 p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none resize-none text-gray-700 leading-relaxed"
                        style={{ fontSize: '16px' }}
                    />

                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-500">
                            {journalEntry.length} ký tự
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setJournalEntry('')}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Trash2 size={18} />
                                Xóa
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!journalEntry.trim()}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <Save size={18} />
                                Lưu lại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Entries */}
                {savedEntries.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 px-2">Các bài viết đã lưu</h2>
                        {savedEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-sm text-gray-500">{entry.date}</div>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {entry.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Helpful Tips */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-200">
                    <h3 className="font-semibold text-gray-800 mb-3">💡 Gợi ý khi viết nhật ký</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• Viết về cảm xúc của bạn, không cần hoàn hảo</li>
                        <li>• Hãy thành thật với bản thân</li>
                        <li>• Không ai đọc ngoài bạn, hãy thoải mái</li>
                        <li>• Viết về những điều tốt đẹp trong ngày</li>
                        <li>• Ghi lại những suy nghĩ đang làm bạn bận tâm</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
