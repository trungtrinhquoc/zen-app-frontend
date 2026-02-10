import { Routes, Route, Navigate } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ChatPage } from './pages/ChatPage';
import { MusicPlayerPage } from './pages/MusicPlayerPage';
import { BreathingExercisePage } from './pages/BreathingExercisePage';
import { RoutinePage } from './pages/RoutinePage';
import { JournalingPage } from './pages/JournalingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/chat" element={<ChatPage />} />

      {/* Activity Pages */}
      <Route path="/activity/music" element={<MusicPlayerPage />} />
      <Route path="/activity/breathing" element={<BreathingExercisePage />} />
      <Route path="/activity/routine/:routineId?" element={<RoutinePage />} />
      <Route path="/activity/journaling" element={<JournalingPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
