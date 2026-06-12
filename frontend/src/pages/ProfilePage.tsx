import { useActivePage } from '@/hooks/useActivePage';
import { FileText, Clock, Star, AlertCircle, Camera, Edit2, Check, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { updateProfile, uploadAvatar } from '@/api/client';

export function ProfilePage() {
  const { setActivePage, isLoggedIn, user, setUser } = useActivePage();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditNickname = useCallback(() => {
    setNickname(user?.nickname || '');
    setEditingNickname(true);
    setError('');
  }, [user?.nickname]);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateProfile({ nickname: nickname.trim() });
      setUser(res.data);
      setEditingNickname(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const res = await uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatar_url: res.data.avatar_url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <nav className="text-sm text-[#b8a898] mb-2">
          <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
          <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
          <span className="text-[#8a7e6b]">个人中心</span>
        </nav>

        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <AlertCircle className="w-8 h-8 text-[#b8a898]" />
          <p className="text-sm text-[#8a7e6b]">请先登录</p>
          <button
            onClick={() => setActivePage('login')}
            className="text-sm text-[#66a85c] hover:underline"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">个人中心</span>
      </nav>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#f0ebe0] flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-[#8a7e6b]">{(user?.nickname || user?.username || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#aed581] text-white flex items-center justify-center hover:bg-[#9bc76d] transition-colors disabled:opacity-50"
              title="更换头像"
            >
              <Camera size={12} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadAvatar}
            />
          </div>
          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581] transition-colors"
                  autoFocus
                  disabled={saving}
                />
                <button
                  onClick={handleSaveNickname}
                  disabled={saving || !nickname.trim()}
                  className="w-7 h-7 rounded-lg bg-[#aed581] text-white flex items-center justify-center hover:bg-[#9bc76d] disabled:opacity-40 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingNickname(false)}
                  disabled={saving}
                  className="w-7 h-7 rounded-lg bg-[#f0ebe0] text-[#8a7e6b] flex items-center justify-center hover:bg-[#e8e0d5] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#3d3428]">{user?.nickname || user?.username || '未知用户'}</h1>
                <button
                  onClick={startEditNickname}
                  className="text-[#b8a898] hover:text-[#8a7e6b] transition-colors"
                  title="修改昵称"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-[#8a7e6b] mt-0.5">{user?.email}</p>
            <p className="text-xs text-[#b8a898] mt-1">注册于 {user?.created_at ? formatDate(user.created_at) : '-'}</p>
          </div>
        </div>
        {error && (
          <p className="text-xs text-[#c2185b] bg-[#fce4ec] rounded-lg px-3 py-2 mt-3">{error}</p>
        )}
      </div>

      {/* 占位统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: FileText, label: '编辑条目', value: '0', color: 'text-[#66a85c] bg-[#f1f8e9]' },
          { icon: Clock, label: '最近活跃', value: '刚刚', color: 'text-[#4a90d9] bg-[#e3f2fd]' },
          { icon: Star, label: '收藏页面', value: '0', color: 'text-[#e6a93f] bg-[#fff8e1]' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-[#3d3428]">{stat.value}</p>
            <p className="text-xs text-[#b8a898]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
