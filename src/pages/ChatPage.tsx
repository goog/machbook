import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { messagesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Message, PublicUser, ChatConversation } from '@/types';

interface ChatPageProps {
  friendId?: string;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

export function ChatPage({ friendId, onBack, onViewProfile }: ChatPageProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 加载聊天列表
  useEffect(() => {
    loadConversations();
  }, []);

  // 如果有指定好友ID，自动选中
  useEffect(() => {
    if (friendId && conversations.length > 0) {
      const conversation = conversations.find(c => c.friendId === friendId);
      if (conversation) {
        setSelectedFriend(conversation.friend);
        loadMessages(friendId);
      }
    }
  }, [friendId, conversations]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('加载聊天列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (friendId: string) => {
    try {
      const data = await messagesApi.getConversation(friendId);
      setMessages(data);
      // 刷新聊天列表以更新未读数
      loadConversations();
    } catch (error) {
      console.error('加载聊天记录失败:', error);
      toast.error('加载聊天记录失败');
    }
  };

  const handleSelectFriend = (friend: PublicUser) => {
    setSelectedFriend(friend);
    loadMessages(friend.id);
    // 聚焦输入框
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    if (isSending || !selectedFriend || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const result = await messagesApi.sendMessage(selectedFriend.id, newMessage.trim());
      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message!]);
        setNewMessage('');
        // 刷新聊天列表
        loadConversations();
      } else {
        toast.error('发送失败', { description: result.error });
      }
    } catch (error) {
      toast.error('发送失败，请重试');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 将 UTC 时间转换为本地时间
  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null;
    // ISO 8601 格式（如 2024-01-15T08:30:00.000Z）会自动识别为 UTC 并转换为本地时间
    return new Date(dateString);
  };

  // 获取日期字符串（用于比较，不含时间）
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const formatTime = (dateString?: string) => {
    const date = parseDate(dateString);
    if (!date) return '';
    // 显示本地时间
    return date.toLocaleTimeString('zh-CN', {
	  //timeZone: 'Asia/Shanghai', // jadd
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString?: string) => {
    const date = parseDate(dateString);
    if (!date) return '';

    const now = new Date();
    const today = getDateKey(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    const dateKey = getDateKey(date);

    if (dateKey === today) {
      return '今天';
    } else if (dateKey === yesterdayKey) {
      return '昨天';
    } else if (now.getFullYear() === date.getFullYear()) {
      // 同年显示月日
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else {
      // 跨年显示完整日期
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // 渲染聊天列表
  const renderConversationList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-rose-500" />
          消息
        </h2>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无消息</p>
            <p className="text-sm mt-1">接受匹配后即可开始聊天</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <button
                key={conversation.friendId}
                onClick={() => handleSelectFriend(conversation.friend)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedFriend?.id === conversation.friendId ? 'bg-rose-50 hover:bg-rose-50' : ''
                }`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-lg">
                    {conversation.friend.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.friend.name}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {conversation.lastMessage?.content || '暂无消息'}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge className="bg-rose-500 text-white min-w-[20px] h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // 渲染聊天窗口
  const renderChatWindow = () => {
    if (!selectedFriend) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">选择一个好友开始聊天</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-white">
        {/* 聊天头部 */}
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFriend(null)}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                {selectedFriend.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{selectedFriend.name}</h3>
              <p className="text-xs text-gray-500">
                {selectedFriend.age}岁 · {selectedFriend.location}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProfile(selectedFriend.id)}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <User className="w-4 h-4 mr-1" />
            查看资料
          </Button>
        </div>

        {/* 消息列表 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>还没有消息</p>
                <p className="text-sm mt-1">发送第一条消息吧~</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = message.sender_id === user?.id;
                // 使用日期 key 比较，避免重复计算且确保时区一致性
                const currentDateKey = getDateKey(parseDate(message.created_at) || new Date());
                const prevDateKey = index === 0 ? '' : getDateKey(parseDate(messages[index - 1].created_at) || new Date());
                const showDate = index === 0 || currentDateKey !== prevDateKey;

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        {!isMe && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-sm">
                              {message.sender?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className={`text-xs mt-1 block ${isMe ? 'text-rose-100' : 'text-gray-400'}`}>
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 输入框 */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              className="flex-1"
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-rose-400 text-rose-500 hover:bg-rose-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">消息中心</h1>
        </div>

        {/* 聊天区域 */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[calc(100vh-220px)] min-h-[500px] flex">
              {/* 左侧：聊天列表 */}
              <div className={`w-full md:w-80 border-r bg-white ${selectedFriend ? 'hidden md:block' : 'block'}`}>
                {renderConversationList()}
              </div>

              {/* 右侧：聊天窗口 */}
              <div className={`flex-1 ${selectedFriend ? 'block' : 'hidden md:block'}`}>
                {renderChatWindow()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
