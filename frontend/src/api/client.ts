// 前端 API 客户端，封装后端 HTTP 接口调用
// 通过 Vite 环境变量配置，开发/生产自动切换
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> || {}),
    },
  });

  const data = await resp.json().catch(() => ({ error: '响应解析失败' }));

  if (!resp.ok) {
    throw new Error(data.error || `请求失败: ${resp.status}`);
  }
  return data as T;
}

// 统一响应结构
interface ApiResponse<T> {
  code: number;
  data: T;
}

// ===== 认证 =====

export interface LoginRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export function login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ===== 用户 =====

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export function getProfile(): Promise<ApiResponse<UserProfile>> {
  return apiRequest('/api/v1/user/profile');
}

export interface UpdateProfileRequest {
  nickname: string;
}

export function updateProfile(req: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
  return apiRequest('/api/v1/user/profile', {
    method: 'PUT',
    body: JSON.stringify(req),
  });
}

export function uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = getToken();
  return fetch(`${API_BASE}/api/v1/user/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (resp) => {
    const data = await resp.json().catch(() => ({ error: '响应解析失败' }));
    if (!resp.ok) throw new Error(data.error || `请求失败: ${resp.status}`);
    return data as ApiResponse<{ avatar_url: string }>;
  });
}

// ===== 反馈 =====

export interface SubmitFeedbackRequest {
  category: 'bug' | 'feature';
  title: string;
  content: string;
  contact?: string;
}

export interface FeedbackRecord {
  id: number;
  user_id?: number;
  category: string;
  title: string;
  content: string;
  contact: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackListResponse {
  total: number;
  page: number;
  page_size: number;
  list: FeedbackRecord[];
  statistics?: {
    total_count: number;
    bug_count: number;
    feature_count: number;
    pending_count: number;
    resolved_count: number;
  };
}

export function submitFeedback(req: SubmitFeedbackRequest): Promise<ApiResponse<FeedbackRecord>> {
  return apiRequest('/api/v1/feedbacks', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export function listFeedbacks(params?: Record<string, string>): Promise<ApiResponse<FeedbackListResponse>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiRequest(`/api/v1/feedbacks${query}`);
}

export function searchFeedbacks(params?: Record<string, string>): Promise<ApiResponse<FeedbackListResponse>> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiRequest(`/api/v1/feedbacks/search${query}`);
}
