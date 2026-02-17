import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { matchesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Heart, X, Check, MapPin, Calendar, Sparkles, Lock, RefreshCw, User, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Match } from '@/types';

interface MatchesPageProps {
  onViewProfile: (userId: string) => void;
}

export function MatchesPage({ onViewProfile }: MatchesPageProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [remainingMatches, setRemainingMatches] = useState(3);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const [userMatches, stats] = await Promise.all([
        matchesApi.getMatches(),
        matchesApi.getRemainingMatches(),
      ]);
      setMatches(userMatches);
      setRemainingMatches(stats.remaining);
    } catch (error) {
      console.error('加载匹配失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    try {
      const result = await matchesApi.acceptMatch(matchId);
      if (result.success) {
        setMatches(matches.map(m => 
          m.id === matchId ? { ...m, status: 'accepted' } : m
        ));
        setSelectedMatch(null);
        toast.success('已接受匹配！你们现在是好友了', {
          description: '现在可以查看对方的照片和完整资料',
        });
      } else {
        toast.error('操作失败', {
          description: result.error || '请稍后重试',
        });
      }
    } catch (error) {
      toast.error('网络错误', {
        description: '请检查网络连接后重试',
      });
    }
  };

  const handleReject = async (matchId: string) => {
    try {
      const result = await matchesApi.rejectMatch(matchId);
      if (result.success) {
        setMatches(matches.map(m => 
          m.id === matchId ? { ...m, status: 'rejected' } : m
        ));
        setSelectedMatch(null);
        toast.info('已婉拒匹配');
      } else {
        toast.error('操作失败', {
          description: result.error || '请稍后重试',
        });
      }
    } catch (error) {
      toast.error('网络错误', {
        description: '请检查网络连接后重试',
      });
    }
  };

  const viewProfile = (userId: string) => {
    setSelectedMatch(null);
    onViewProfile(userId);
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
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">正在寻找心动的人...</p>
        </div>
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            本周的心动推荐
          </h1>
          <p className="text-gray-600 mb-4">
            基于你的问卷答案，为你精心挑选
          </p>
          
          {/* 剩余匹配数 */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-gray-700">
              本周还可获得 <span className="font-semibold text-rose-500">{remainingMatches}</span> 个匹配
            </span>
          </div>
        </div>

        {/* Matches Grid */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card
                key={match.id}
                className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden cursor-pointer transform transition-all hover:scale-105 ${
                  match.status === 'accepted' ? 'ring-2 ring-green-400' : ''
                } ${match.status === 'rejected' ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-0">
                  {/* Avatar Section */}
                  <div 
                    className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {match.matched_user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-rose-500 font-semibold">
                        {match.compatibility_score}% 匹配
                      </Badge>
                    </div>
                    {match.status === 'accepted' && (
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-green-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          已接受
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {match.matched_user?.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewProfile(match.matched_user_id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看资料
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {match.matched_user?.age && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {match.matched_user.age}岁
                        </span>
                      )}
                      {match.matched_user?.gender && (
                        <>
                          <span>·</span>
                          <span>{getGenderText(match.matched_user.gender)}</span>
                        </>
                      )}
                      {match.matched_user?.location && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {match.matched_user.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Match Reasons */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">匹配原因：</p>
                      <div className="flex flex-wrap gap-2">
                        {match.match_reason?.map((reason: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                本周匹配已用完
              </h3>
              <p className="text-gray-600 mb-4">
                你本周已经获得了 3 个匹配。下周一会刷新匹配次数。
              </p>
              <Button
                variant="outline"
                onClick={loadMatches}
                className="border-rose-400 text-rose-500 hover:bg-rose-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Match Detail Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-md">
          {selectedMatch && selectedMatch.matched_user && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {selectedMatch.matched_user.name?.charAt(0) || '?'}
                  </div>
                  <span className="text-2xl">{selectedMatch.matched_user.name}</span>
                </DialogTitle>
                <DialogDescription className="text-center">
                  <Badge className="bg-rose-100 text-rose-600">
                    {selectedMatch.compatibility_score}% 匹配度
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  {selectedMatch.matched_user.age && (
                    <span>{selectedMatch.matched_user.age}岁</span>
                  )}
                  {selectedMatch.matched_user.gender && (
                    <>
                      <span>·</span>
                      <span>{getGenderText(selectedMatch.matched_user.gender)}</span>
                    </>
                  )}
                  {selectedMatch.matched_user.location && (
                    <>
                      <span>·</span>
                      <span>{selectedMatch.matched_user.location}</span>
                    </>
                  )}
                </div>

                {/* Bio */}
                {selectedMatch.matched_user.bio && (
                  <p className="text-gray-600 text-center italic">
                    &ldquo;{selectedMatch.matched_user.bio}&rdquo;
                  </p>
                )}

                {/* Photo Privacy Notice */}
                <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-700">
                    照片在双方接受匹配后可见
                  </p>
                </div>

                {/* Match Reasons */}
                <div className="bg-rose-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">为什么推荐：</p>
                  <ul className="space-y-1">
                    {selectedMatch.match_reason?.map((reason: string, idx: number) => (
                      <li key={idx} className="text-sm text-rose-600 flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* View Profile Button */}
                <Button
                  variant="outline"
                  onClick={() => viewProfile(selectedMatch.matched_user_id)}
                  className="w-full border-rose-400 text-rose-500 hover:bg-rose-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  查看完整资料
                </Button>

                {/* Actions */}
                {selectedMatch.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                      onClick={() => handleReject(selectedMatch.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      婉拒
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
                      onClick={() => handleAccept(selectedMatch.id)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      心动
                    </Button>
                  </div>
                )}

                {selectedMatch.status === 'accepted' && (
                  <div className="text-center pt-4">
                    <Badge className="bg-green-500 text-white px-4 py-2">
                      <Check className="w-4 h-4 mr-2" />
                      已接受匹配
                    </Badge>
                    <p className="text-sm text-gray-500 mt-2">
                      现在可以查看对方的照片了
                    </p>
                  </div>
                )}

                {selectedMatch.status === 'rejected' && (
                  <div className="text-center pt-4">
                    <Badge variant="secondary" className="px-4 py-2">
                      已婉拒
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
