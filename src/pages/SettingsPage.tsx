const SettingsPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <div className="w-12 h-6 bg-zen-primary rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span>Notifications</span>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
