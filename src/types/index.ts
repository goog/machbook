// 用户类型（完整，包含敏感信息）
export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location?: string;
  photo_url?: string;
  hobbies?: string;
  favorite_food?: string;
  created_at?: string;
  questionnaire_completed?: boolean;
  can_view_photo?: boolean;
}

// 公开用户类型（不包含敏感信息，用于好友列表、匹配列表等）
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location?: string;
  photo_url?: string;
  hobbies?: string;
  favorite_food?: string;
  created_at?: string;
  questionnaire_completed?: boolean;
}

// 问卷答案类型
export interface QuestionnaireAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
}

// 匹配记录类型
export interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  compatibility_score: number;
  match_reason: string[];
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  week_start: string;
  matched_user?: PublicUser;
}

// 好友关系类型
export interface Friendship {
  id: number;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at?: string;
  friend?: PublicUser;
}

// 本周匹配统计
export interface WeeklyMatchStats {
  id?: number;
  user_id: string;
  week_start: string;
  match_count: number;
  max_matches: number;
}

// 消息类型
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  sender?: PublicUser;
}

// 聊天记录（按好友分组）
export interface ChatConversation {
  friendId: string;
  friend: PublicUser;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
}

// 问题类型
export interface Question {
  id: number;
  question: string;
  options: {
    value: string;
    label: string;
  }[];
}

// 认证状态
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
