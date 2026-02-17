import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi, uploadApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Heart,
  MapPin,
  Calendar,
  Camera,
  Edit2,
  X,
  Check,
  ArrowLeft,
  Lock,
  Sparkles,
  UtensilsCrossed,
  Users,
  UserCheck
} from 'lucide-react';
import type { User } from '@/types';

interface ProfilePageProps {
  userId: string;
  onBack: () => void;
}

export function ProfilePage({ userId, onBack }: ProfilePageProps) {
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editHobbies, setEditHobbies] = useState('');
  const [editFavoriteFood, setEditFavoriteFood] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<{ friendCount: number; totalMatches: number; acceptedMatches: number } | null>(null);

  const isSelf = currentUser?.id === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [userProfile, userStats] = await Promise.all([
        authApi.getUserProfile(userId),
        authApi.getUserStats(userId),
      ]);
      if (userProfile) {
        setProfile(userProfile);
        setEditName(userProfile.name);
        setEditBio(userProfile.bio || '');
        setEditLocation(userProfile.location || '');
        setEditHobbies(userProfile.hobbies || '');
        setEditFavoriteFood(userProfile.favorite_food || '');
      }
      if (userStats) {
        setStats(userStats);
      }
    } catch (error) {
      console.error('加载资料失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('照片大小不能超过 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setIsUploading(true);
    try {
      const result = await uploadApi.uploadPhoto(photoFile);
      if (result.success) {
        await loadProfile();
        setPhotoFile(null);
        setPhotoPreview(null);
      } else {
        alert('上传失败: ' + result.error);
      }
    } catch (error) {
      alert('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const result = await authApi.updateProfile({
      name: editName,
      bio: editBio,
      location: editLocation,
      hobbies: editHobbies,
      favorite_food: editFavoriteFood,
    });
    if (result.success) {
      setIsEditing(false);
      await loadProfile();
    } else {
      alert('保存失败: ' + result.error);
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

  // 根据用户名生成渐变色
  const getAvatarGradient = (name: string): string => {
    const gradients = [
      'from-rose-400 to-pink-500',      // 玫瑰粉
      'from-blue-400 to-indigo-500',    // 靛蓝
      'from-green-400 to-emerald-500',  // 翠绿
      'from-purple-400 to-violet-500',  // 紫罗兰
      'from-orange-400 to-amber-500',   // 橙黄
      'from-cyan-400 to-teal-500',      // 青绿
      'from-red-400 to-rose-500',       // 红玫瑰
      'from-indigo-400 to-blue-500',    // 深蓝
      'from-yellow-400 to-orange-500',  // 金黄
      'from-pink-400 to-fuchsia-500',   // 玫红
      'from-teal-400 to-cyan-500',      // 青色
      'from-lime-400 to-green-500',     // 草绿
    ];

    // 使用用户名字符的 Unicode 码点之和作为种子
    let seed = 0;
    for (let i = 0; i < name.length; i++) {
      seed += name.charCodeAt(i);
    }

    return gradients[seed % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-rose-400 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">用户不存在</p>
            <Button onClick={onBack} className="mt-4">
              返回
            </Button>
          </CardContent>
        </Card>
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

      <div className="max-w-2xl mx-auto relative z-10">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* 封面 */}
          <div className="h-48 bg-gradient-to-br from-rose-200 to-pink-300 relative">
            {isSelf && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                编辑资料
              </Button>
            )}
          </div>

          {/* 头像区域 - 只显示首字母 */}
          <div className="px-8 pb-8">
            <div className="relative -mt-20 mb-6">
              <div className="w-32 h-32 rounded-full shadow-md ring-4 ring-white shadow-lg overflow-hidden bg-white">
                <div className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(profile.name)} flex items-center justify-center text-white text-4xl font-bold`}>
                  {profile.name.charAt(0)}
                </div>
              </div>

              {/* 自己上传照片按钮 */}
              {isSelf && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* 用户信息 */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {profile.age}岁
                </span>
                <span>·</span>
                <span>{getGenderText(profile.gender)}</span>
                {profile.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 统计数据 */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-rose-600 mb-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-medium">心动匹配</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalMatches}</p>
                  <p className="text-xs text-gray-500">已接受 {stats.acceptedMatches}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">好友</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.friendCount}</p>
                  <p className="text-xs text-gray-500">互相关注</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">成功率</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalMatches > 0 ? Math.round((stats.acceptedMatches / stats.totalMatches) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">接受比例</p>
                </div>
              </div>
            )}

            {/* 照片展示区 */}
            {profile.photo_url && profile.can_view_photo && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  照片
                </h3>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={`http://localhost:3001${profile.photo_url}`}
                    alt={profile.name}
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              </div>
            )}

            {/* 照片隐私提示（有照片但不可看） */}
            {profile.photo_url && !profile.can_view_photo && (
              <div className="mb-6 p-6 bg-gray-100 rounded-xl text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">照片在匹配成功后可见</p>
              </div>
            )}

            {/* 简介 */}
            {profile.bio ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-600 text-center italic">&ldquo;{profile.bio}&rdquo;</p>
              </div>
            ) : (
              isSelf && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                  <p className="text-gray-400 text-sm">还没有写简介，点击编辑资料添加吧~</p>
                </div>
              )
            )}

            {/* 爱好和美食 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {profile.hobbies && (
                <div className="bg-rose-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-rose-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">爱好</span>
                  </div>
                  <p className="text-gray-700">{profile.hobbies}</p>
                </div>
              )}
              {profile.favorite_food && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 text-orange-600">
                    <UtensilsCrossed className="w-4 h-4" />
                    <span className="text-sm font-medium">喜欢的美食</span>
                  </div>
                  <p className="text-gray-700">{profile.favorite_food}</p>
                </div>
              )}
            </div>

            {/* 问卷完成状态 */}
            <div className="flex justify-center">
              <Badge 
                variant={profile.questionnaire_completed ? 'default' : 'secondary'}
                className={profile.questionnaire_completed ? 'bg-green-500' : ''}
              >
                {profile.questionnaire_completed ? '已完成问卷' : '未完成问卷'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* 编辑资料对话框 */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑资料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>昵称</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="你的昵称"
              />
            </div>
            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="介绍一下自己..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>所在地</Label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="例如：北京"
              />
            </div>
            <div className="space-y-2">
              <Label>爱好</Label>
              <Input
                value={editHobbies}
                onChange={(e) => setEditHobbies(e.target.value)}
                placeholder="例如：阅读、旅行、摄影"
              />
            </div>
            <div className="space-y-2">
              <Label>喜欢的美食</Label>
              <Input
                value={editFavoriteFood}
                onChange={(e) => setEditFavoriteFood(e.target.value)}
                placeholder="例如：火锅、日料、甜品"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500"
              >
                <Check className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 照片上传预览对话框 */}
      <Dialog open={!!photoPreview} onOpenChange={() => { setPhotoPreview(null); setPhotoFile(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认上传照片</DialogTitle>
          </DialogHeader>
          {photoPreview && (
            <div className="space-y-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
                <Button
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500"
                >
                  {isUploading ? '上传中...' : '确认上传'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
