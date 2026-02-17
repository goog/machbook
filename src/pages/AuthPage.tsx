import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi, uploadApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Mail, Lock, User, Calendar, MapPin, Camera, X, Sparkles, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function AuthPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 登录表单
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册表单
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAge, setRegisterAge] = useState('');
  const [registerGender, setRegisterGender] = useState('');
  const [registerLocation, setRegisterLocation] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(loginEmail, loginPassword);
    if (!success) {
      setError('邮箱或密码错误');
    }

    setIsLoading(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('照片大小不能超过 5MB');
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

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 发送短信验证码
  const handleSendCode = async () => {
    if (!registerPhone) {
      setError('请先填写手机号');
      return;
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(registerPhone)) {
      setError('手机号格式不正确');
      return;
    }

    setIsSendingCode(true);
    setError('');

    const result = await authApi.sendVerificationCode(registerPhone);

    if (result.success) {
      setCountdown(300);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error || '发送失败');
    }

    setIsSendingCode(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 验证
    if (registerName.length < 2) {
      setError('昵称至少需要2个字符');
      setIsLoading(false);
      return;
    }

    if (!registerPhone) {
      setError('请填写手机号');
      setIsLoading(false);
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(registerPhone)) {
      setError('手机号格式不正确');
      setIsLoading(false);
      return;
    }

    if (!verificationCode) {
      setError('请填写短信验证码');
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError('密码至少需要6个字符');
      setIsLoading(false);
      return;
    }

    const age = parseInt(registerAge);
    if (!age || age < 18 || age > 100) {
      setError('年龄必须在 18-100 岁之间');
      setIsLoading(false);
      return;
    }

    if (!registerGender) {
      setError('请选择性别');
      setIsLoading(false);
      return;
    }

    // 注册用户
    const result = await authApi.register({
      name: registerName,
      phone: registerPhone,
      email: registerEmail || undefined,
      password: registerPassword,
      age,
      gender: registerGender,
      location: registerLocation,
      verificationCode,
    });

    if (!result.success) {
      setError(result.error || '注册失败');
      setIsLoading(false);
      return;
    }

    // 上传照片（如果有）
    if (photoFile && result.token) {
      const uploadResult = await uploadApi.uploadPhoto(photoFile);
      if (!uploadResult.success) {
        console.warn('照片上传失败:', uploadResult.error);
      }
    }

    // 注册成功提示
    toast.success('注册成功！', {
      description: '欢迎加入心动相遇，请完成问卷开始匹配',
    });

    setIsLoading(false);

    // 触发页面刷新以进入应用（AuthContext 会检测到已登录状态）
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            心动相遇
          </h1>
          <p className="text-gray-600 mt-2">遇见那个懂你的人</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-white">登录</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">欢迎回来</CardTitle>
                <CardDescription>继续你的心动之旅</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-700">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-700">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="输入密码"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-rose-500 text-center">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  开始你的旅程
                </CardTitle>
                <CardDescription>填写信息，遇见心动的人</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* 昵称 */}
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-700">昵称</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="你的昵称"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>

                  {/* 手机号 */}
                  <div className="space-y-2">
                    <Label htmlFor="register-phone" className="text-gray-700">手机号</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="11位手机号"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                        maxLength={11}
                      />
                    </div>
                  </div>

                  {/* 短信验证码 */}
                  <div className="space-y-2">
                    <Label htmlFor="verification-code" className="text-gray-700">短信验证码</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="4位验证码"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                        maxLength={4}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendCode}
                        disabled={isSendingCode || countdown > 0}
                        className="whitespace-nowrap min-w-[100px]"
                      >
                        {countdown > 0 ? `${countdown}s` : isSendingCode ? '发送中...' : '获取验证码'}
                      </Button>
                    </div>
                  </div>

                  {/* 邮箱（可选） */}
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-700">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@qq.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  {/* 密码 */}
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-700">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="至少6位字符"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>

                  {/* 年龄 */}
                  <div className="space-y-2">
                    <Label htmlFor="register-age" className="text-gray-700">年龄</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-age"
                        type="number"
                        placeholder="20"
                        min={16}
                        max={50}
                        value={registerAge}
                        onChange={(e) => setRegisterAge(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        required
                      />
                    </div>
                  </div>

                  {/* 性别 */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">性别</Label>
                    <RadioGroup
                      value={registerGender}
                      onValueChange={setRegisterGender}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">男</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">女</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">其他</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 所在地 */}
                  <div className="space-y-2">
                    <Label htmlFor="register-location" className="text-gray-700">所在地</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-location"
                        type="text"
                        placeholder="例如：北京"
                        value={registerLocation}
                        onChange={(e) => setRegisterLocation(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  {/* 照片上传 */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">日常照片</Label>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      {!photoPreview ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors"
                        >
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">点击上传照片</p>
                          <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 5MB</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-rose-500 text-center">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          注册即表示你同意我们的服务条款
        </p>
      </div>
    </div>
  );
}
