import { useState } from 'react';
import { useActivePage } from '@/hooks/useActivePage';
import { LogIn, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { login, setToken } from '@/api/client';

export function LoginPage() {
  const { setActivePage, setIsLoggedIn, setUser, bgSettings } = useActivePage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isImageBg = bgSettings.mode === 'image' && bgSettings.imageUrl;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写所有字段');
      return;
    }
    setLoading(true);
    try {
      const res = await login({ username, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setIsLoggedIn(true);
      setActivePage('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          w-full max-w-sm rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]
          ${isImageBg ? 'bg-white/80 backdrop-blur-xl' : 'bg-white'}
        `}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/images/logo.png" alt="星布谷地" className="h-14 mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-[#3d3428]">欢迎回来</h1>
          <p className="text-xs text-[#b8a898] mt-1">登录或注册新账号</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-[#8a7e6b] mb-1.5 block">用户名</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8a898]" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="
                  w-full pl-10 pr-4 py-2.5 rounded-xl
                  bg-[#faf6ef] border border-[#e8e0d5]
                  text-sm text-[#3d3428] placeholder:text-[#b8a898]
                  outline-none transition-all
                  focus:border-[#aed581] focus:ring-[3px] focus:ring-[#aed581]/20
                "
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8a7e6b] mb-1.5 block">邮箱</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8a898]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="
                  w-full pl-10 pr-4 py-2.5 rounded-xl
                  bg-[#faf6ef] border border-[#e8e0d5]
                  text-sm text-[#3d3428] placeholder:text-[#b8a898]
                  outline-none transition-all
                  focus:border-[#aed581] focus:ring-[3px] focus:ring-[#aed581]/20
                "
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8a7e6b] mb-1.5 block">密码</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8a898]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="
                  w-full pl-10 pr-10 py-2.5 rounded-xl
                  bg-[#faf6ef] border border-[#e8e0d5]
                  text-sm text-[#3d3428] placeholder:text-[#b8a898]
                  outline-none transition-all
                  focus:border-[#aed581] focus:ring-[3px] focus:ring-[#aed581]/20
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8a898] hover:text-[#8a7e6b]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#c2185b] bg-[#fce4ec] rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-2.5 rounded-xl font-medium text-white text-sm
              transition-all duration-200
              bg-[#aed581] hover:bg-[#9bc76d] hover:shadow-lg active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <span className="flex items-center justify-center gap-2">
              <LogIn size={16} />
              {loading ? '登录中...' : '登录 / 注册'}
            </span>
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => setActivePage('home')}
            className="text-xs text-[#b8a898] hover:text-[#66a85c] transition-colors"
          >
            暂不登录，先逛逛
          </button>
        </div>
      </motion.div>
    </div>
  );
}
