import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { AuthPage } from '@/pages/AuthPage';
import { QuestionnairePage } from '@/pages/QuestionnairePage';
import { MatchesPage } from '@/pages/MatchesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FriendsPage } from '@/pages/FriendsPage';
import { ChatPage } from '@/pages/ChatPage';
import { Toaster } from 'sonner';
import './App.css';

// 页面类型
type PageType = 'matches' | 'profile' | 'friends' | 'myProfile' | 'chat';

interface PageState {
  page: PageType;
  userId?: string;
  friendId?: string;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [pageState, setPageState] = useState<PageState>({ page: 'matches' });

  const navigateToProfile = (userId: string) => {
    setPageState({ page: 'profile', userId });
  };

  const navigateToMatches = () => {
    setPageState({ page: 'matches' });
  };

  const navigateToFriends = () => {
    setPageState({ page: 'friends' });
  };

  const navigateToMyProfile = () => {
    if (user?.id) {
      setPageState({ page: 'myProfile', userId: user.id });
    }
  };

  const navigateToChat = (friendId?: string) => {
    setPageState({ page: 'chat', friendId });
  };

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (!user?.questionnaire_completed) {
    return (
      <>
        <Navigation />
        <QuestionnairePage />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
      <Navigation
        onViewFriends={navigateToFriends}
        onViewProfile={navigateToMyProfile}
        onViewChat={() => navigateToChat()}
        onViewHome={navigateToMatches}
      />
      {pageState.page === 'matches' && (
        <MatchesPage onViewProfile={navigateToProfile} />
      )}
      {pageState.page === 'profile' && pageState.userId && (
        <ProfilePage
          userId={pageState.userId}
          onBack={navigateToMatches}
        />
      )}
      {pageState.page === 'myProfile' && user?.id && (
        <ProfilePage
          userId={user.id}
          onBack={navigateToMatches}
        />
      )}
      {pageState.page === 'friends' && (
        <FriendsPage
          onViewProfile={navigateToProfile}
          onBack={navigateToMatches}
          onChat={navigateToChat}
        />
      )}
      {pageState.page === 'chat' && (
        <ChatPage
          friendId={pageState.friendId}
          onBack={navigateToMatches}
          onViewProfile={navigateToProfile}
        />
      )}
      <Footer />
      <Toaster position="top-center" richColors />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
