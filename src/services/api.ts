import type { User, QuestionnaireAnswers, Match, Friendship, Message, ChatConversation } from '@/types';

// 导出基础 URL 供其他模块使用
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// 获取 token
function getToken(): string | null {
  return localStorage.getItem('soulmatch_token');
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 如果不是 FormData，添加 Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '请求失败');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

// 认证相关 API
export const authApi = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const result = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
      localStorage.setItem('soulmatch_token', result.data.token);
      localStorage.setItem('soulmatch_user', JSON.stringify(result.data.user));
      return { success: true, user: result.data.user, token: result.data.token };
    }

    return { success: false, error: result.error };
  },

  async register(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    age: number;
    gender: string;
    location?: string;
    verificationCode: string;
  }): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const result = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data) {
      localStorage.setItem('soulmatch_token', result.data.token);
      localStorage.setItem('soulmatch_user', JSON.stringify(result.data.user));
      return { success: true, user: result.data.user, token: result.data.token };
    }

    return { success: false, error: result.error };
  },

  async getCurrentUser(): Promise<User | null> {
    const result = await request<User>('/auth/me');
    if (result.success && result.data) {
      localStorage.setItem('soulmatch_user', JSON.stringify(result.data));
      return result.data;
    }
    return null;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const result = await request<User>(`/auth/profile/${userId}`);
    return result.success ? result.data || null : null;
  },

  async getUserStats(userId: string): Promise<{ friendCount: number; totalMatches: number; acceptedMatches: number } | null> {
    const result = await request<{ friendCount: number; totalMatches: number; acceptedMatches: number }>(`/auth/stats/${userId}`);
    return result.success ? result.data || null : null;
  },

  async updateProfile(data: { name?: string; bio?: string; location?: string; hobbies?: string; favorite_food?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const result = await request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { success: result.success, user: result.data, error: result.error };
  },

  logout(): void {
    localStorage.removeItem('soulmatch_token');
    localStorage.removeItem('soulmatch_user');
  },

  getStoredUser(): User | null {
    const data = localStorage.getItem('soulmatch_user');
    return data ? JSON.parse(data) : null;
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },

  // 发送短信验证码
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const result = await request('/sms/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return { success: result.success, message: result.message, error: result.error };
  },
};

// 上传相关 API
export const uploadApi = {
  async uploadPhoto(file: File): Promise<{ success: boolean; photoUrl?: string; error?: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/upload/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      return {
        success: result.success,
        photoUrl: result.data?.photoUrl,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      };
    }
  },
};

// 问卷相关 API
export const questionnaireApi = {
  async saveAnswers(answers: QuestionnaireAnswers): Promise<{ success: boolean; error?: string }> {
    const result = await request('/questionnaire/save', {
      method: 'POST',
      body: JSON.stringify(answers),
    });

    return { success: result.success, error: result.error };
  },

  async getAnswers(): Promise<QuestionnaireAnswers | null> {
    const result = await request<QuestionnaireAnswers>('/questionnaire/answers');
    return result.success ? result.data || null : null;
  },
};

// 匹配相关 API
export const matchesApi = {
  async getMatches(): Promise<Match[]> {
    const result = await request<Match[]>('/matches');
    return result.success ? result.data || [] : [];
  },

  async acceptMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/matches/${matchId}/accept`, {
      method: 'POST',
    });
    return { success: result.success, error: result.error };
  },

  async rejectMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/matches/${matchId}/reject`, {
      method: 'POST',
    });
    return { success: result.success, error: result.error };
  },

  async getRemainingMatches(): Promise<{ remaining: number; max: number; used: number }> {
    const result = await request<{ remaining: number; max: number; used: number }>('/matches/stats/remaining');
    return result.success && result.data
      ? result.data
      : { remaining: 0, max: 3, used: 0 };
  },
};

// 好友相关 API
export const friendsApi = {
  async getFriends(): Promise<Friendship[]> {
    const result = await request<Friendship[]>('/friends');
    return result.success ? result.data || [] : [];
  },

  async addFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request('/friends/add', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
    return { success: result.success, error: result.error };
  },

  async removeFriend(friendId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/friends/${friendId}`, {
      method: 'DELETE',
    });
    return { success: result.success, error: result.error };
  },

  async checkFriendship(friendId: string): Promise<boolean> {
    const result = await request<{ isFriend: boolean }>(`/friends/check/${friendId}`);
    return result.success ? result.data?.isFriend || false : false;
  },

  async getFriendCount(): Promise<number> {
    const result = await request<{ count: number }>('/friends/count');
    return result.success ? result.data?.count || 0 : 0;
  },
};

// 消息相关 API
export const messagesApi = {
  // 发送消息
  async sendMessage(receiverId: string, content: string): Promise<{ success: boolean; message?: Message; error?: string }> {
    const result = await request<Message>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
    return { success: result.success, message: result.data, error: result.error };
  },

  // 获取与特定好友的聊天记录
  async getConversation(friendId: string): Promise<Message[]> {
    const result = await request<Message[]>(`/messages/conversation/${friendId}`);
    return result.success ? result.data || [] : [];
  },

  // 获取所有聊天记录列表
  async getConversations(): Promise<ChatConversation[]> {
    const result = await request<ChatConversation[]>('/messages/conversations');
    return result.success ? result.data || [] : [];
  },

  // 获取未读消息总数
  async getUnreadCount(): Promise<number> {
    const result = await request<{ count: number }>('/messages/unread/count');
    return result.success ? result.data?.count || 0 : 0;
  },

  // 标记消息为已读
  async markAsRead(friendId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/messages/read/${friendId}`, {
      method: 'POST',
    });
    return { success: result.success, error: result.error };
  },
};
