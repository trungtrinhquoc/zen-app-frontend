const SettingsPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Settings</h1>
            <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm">Dark Mode</span>
                    <div className="w-11 h-6 bg-zen-primary rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <div className="w-11 h-6 bg-white/10 rounded-full relative">
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white/40 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
