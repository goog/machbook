import { useState, useEffect } from 'react';
import { friendsApi } from '@/services/api';
import type { Friendship } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Search, 
  UserX, 
  MessageCircle,
  Users,
  ArrowLeft
} from 'lucide-react';

interface FriendsPageProps {
  onViewProfile: (userId: string) => void;
  onBack: () => void;
  onChat?: (friendId: string) => void;
}

export function FriendsPage({ onViewProfile, onBack, onChat }: FriendsPageProps) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = friends.filter(f => 
        f.friend?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.friend?.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friendList = await friendsApi.getFriends();
      setFriends(friendList);
      setFilteredFriends(friendList);
    } catch (error) {
      console.error('加载好友列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('确定要删除这位好友吗？')) return;
    
    setRemovingId(friendId);
    try {
      const result = await friendsApi.removeFriend(friendId);
      if (result.success) {
        setFriends(friends.filter(f => f.friend_id !== friendId));
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setRemovingId(null);
    }
  };

  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return '男';
      case 'female': return '女';
      case 'other': return '其他';
      default: return '未知';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-bold text-gray-800">我的好友</h1>
            <Badge variant="secondary" className="ml-2">
              {friends.length}
            </Badge>
          </div>
          <div className="w-20" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索好友..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Friends List */}
        {filteredFriends.length > 0 ? (
          <div className="space-y-4">
            {filteredFriends.map((friendship) => (
              <Card 
                key={friendship.id} 
                className="border-0 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div 
                      className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold cursor-pointer"
                      onClick={() => friendship.friend && onViewProfile(friendship.friend.id)}
                    >
                      {friendship.friend?.photo_url ? (
                        <img
                          src={`http://localhost:3001${friendship.friend.photo_url}`}
                          alt={friendship.friend.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        friendship.friend?.name.charAt(0)
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-rose-500"
                        onClick={() => friendship.friend && onViewProfile(friendship.friend.id)}
                      >
                        {friendship.friend?.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {friendship.friend?.age}岁
                        </span>
                        <span>·</span>
                        <span>{getGenderText(friendship.friend?.gender)}</span>
                        {friendship.friend?.location && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {friendship.friend.location}
                            </span>
                          </>
                        )}
                      </div>
                      {friendship.friend?.bio && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                          {friendship.friend.bio}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {onChat && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => friendship.friend && onChat(friendship.friend.id)}
                          className="border-rose-400 text-rose-500 hover:bg-rose-50"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          聊天
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => friendship.friend && onViewProfile(friendship.friend.id)}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        资料
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFriend(friendship.friend_id)}
                        disabled={removingId === friendship.friend_id}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery ? '没有找到匹配的好友' : '还没有好友'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? '尝试其他搜索关键词' 
                  : '接受匹配推荐，结识更多心动的人'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
