import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { friendsApi, messagesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Heart,
  User,
  LogOut,
  Sparkles,
  Users,
  MessageCircle
} from 'lucide-react';

interface NavigationProps {
  onViewFriends?: () => void;
  onViewProfile?: () => void;
  onViewChat?: () => void;
  onViewHome?: () => void;
}

export function Navigation({ onViewFriends, onViewProfile, onViewChat, onViewHome }: NavigationProps) {
  const { user, logout } = useAuth();
  const [friendCount, setFriendCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载好友数量和未读消息数
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [friendCountResult, unreadCountResult] = await Promise.all([
          friendsApi.getFriendCount(),
          messagesApi.getUnreadCount(),
        ]);
        setFriendCount(friendCountResult);
        setUnreadCount(unreadCountResult);
      } catch (error) {
        console.error('加载数量失败:', error);
      }
    };
    loadCounts();

    // 每30秒刷新一次未读消息数
    const interval = setInterval(loadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onViewHome}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              心动相遇
            </span>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Chat Button */}
              {onViewChat && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewChat}
                  className="text-gray-600 hover:text-rose-500 hover:bg-rose-50 relative"
                >
                  <MessageCircle className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">消息</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              )}

              {/* Friends Button */}
              {onViewFriends && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewFriends}
                  className="text-gray-600 hover:text-rose-500 hover:bg-rose-50 relative"
                >
                  <Users className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">好友</span>
                  {friendCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                      {friendCount > 99 ? '99+' : friendCount}
                    </span>
                  )}
                </Button>
              )}

              <div className="hidden md:flex items-center gap-2 text-gray-600 ml-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span className="text-sm">你好，{user.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-rose-400"
                  onClick={onViewProfile}
                >
                  <User className="w-4 h-4 text-rose-500" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-500 hover:text-rose-500 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
