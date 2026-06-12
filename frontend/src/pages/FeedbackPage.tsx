import { useActivePage } from '@/hooks/useActivePage';
import { Bug, Lightbulb, Send, CheckCircle, Clock, Hash, Link, ListOrdered } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { submitFeedback, listFeedbacks } from '@/api/client';
import type { FeedbackRecord as ApiFeedbackRecord } from '@/api/client';

interface DisplayFeedbackRecord {
  id: string;
  type: 'bug' | 'suggest';
  title: string;
  content: string;
  bugId?: string;
  page?: string;
  steps?: string;
  status: 'open' | 'resolved' | 'pending';
  time: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`;
  return date.toLocaleDateString('zh-CN');
}

function mapCategoryToType(category: string): 'bug' | 'suggest' {
  return category === 'bug' ? 'bug' : 'suggest';
}

function mapStatus(status: string): 'open' | 'resolved' | 'pending' {
  if (status === 'resolved') return 'resolved';
  if (status === 'pending') return 'pending';
  return 'open';
}

function buildContent(
  content: string,
  type: 'bug' | 'suggest',
  bugId: string,
  page: string,
  steps: string,
): string {
  if (type !== 'bug') return content;
  const parts: string[] = [content];
  if (bugId.trim()) parts.push(`Bug ID: ${bugId.trim()}`);
  if (page.trim()) parts.push(`关联页面: ${page.trim()}`);
  if (steps.trim()) parts.push(`复现步骤:\n${steps.trim()}`);
  return parts.join('\n\n');
}

export function FeedbackPage() {
  const { setActivePage } = useActivePage();
  const [type, setType] = useState<'bug' | 'suggest'>('bug');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bugId, setBugId] = useState('');
  const [page, setPage] = useState('');
  const [steps, setSteps] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<DisplayFeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const statusStyle = {
    open: { bg: 'bg-[#fce4ec]', text: 'text-[#c2185b]', label: '待处理' },
    pending: { bg: 'bg-[#fff8e1]', text: 'text-[#e65100]', label: '处理中' },
    resolved: { bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]', label: '已解决' },
  };

  const typeStyle = {
    bug: { bg: 'bg-[#fce4ec]', text: 'text-[#c2185b]', label: 'Bug' },
    suggest: { bg: 'bg-[#e3f2fd]', text: 'text-[#1565c0]', label: '建议' },
  };

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    listFeedbacks({ page: '1', page_size: '20' })
      .then((res) => {
        const list: DisplayFeedbackRecord[] = (res.data.list || []).map((item: ApiFeedbackRecord) => ({
          id: String(item.id),
          type: mapCategoryToType(item.category),
          title: item.title,
          content: item.content,
          status: mapStatus(item.status),
          time: formatRelativeTime(item.created_at),
        }));
        setHistory(list);
      })
      .catch((err: Error) => {
        setError(err.message || '加载反馈记录失败');
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  }, []);

  useEffect(() => {
    if (showHistory) {
      queueMicrotask(() => loadHistory());
    }
  }, [showHistory, loadHistory]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const body = buildContent(content, type, bugId, page, steps);
      await submitFeedback({
        category: type === 'bug' ? 'bug' : 'feature',
        title: title.trim(),
        content: body,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setTitle('');
    setContent('');
    setBugId('');
    setPage('');
    setSteps('');
    setError('');
  };

  return (
    <div>
      <nav className="text-sm text-[#b8a898] mb-2">
        <button onClick={() => setActivePage('home')} className="hover:text-[#66a85c] transition-colors">Wiki 首页</button>
        <span className="mx-1.5 text-[#d4c8b8]">&gt;</span>
        <span className="text-[#8a7e6b]">反馈</span>
      </nav>
      <h1 className="text-3xl font-bold text-[#4a6741] mb-1">反馈</h1>
      <p className="text-[#8a7e6b] mb-6">帮助我们做得更好</p>

      {/* 切换：提交 / 记录 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowHistory(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !showHistory ? 'bg-[#aed581] text-white shadow-sm' : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
          }`}
        >
          <Send size={14} /> 提交反馈
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            showHistory ? 'bg-[#aed581] text-white shadow-sm' : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
          }`}
        >
          <Clock size={14} /> 反馈记录
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">{history.length}</span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-[#c2185b] bg-[#fce4ec] rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      {!showHistory ? (
        /* 提交表单 */
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
          {!submitted ? (
            <>
              {/* 类型切换 */}
              <div className="flex gap-3 mb-5">
                {[
                  { id: 'bug' as const, label: 'Bug 反馈', icon: Bug },
                  { id: 'suggest' as const, label: '功能建议', icon: Lightbulb },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      type === t.id ? 'bg-[#aed581] text-white shadow-sm' : 'bg-[#faf6ef] text-[#6b5d4d] hover:bg-[#f0ebe0]'
                    }`}
                  >
                    <t.icon size={16} /> {t.label}
                  </button>
                ))}
              </div>

              {/* 标题 */}
              <div className="mb-4">
                <label className="text-xs text-[#8a7e6b] mb-1.5 block">标题</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={type === 'bug' ? '简要描述 Bug' : '功能名称'}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581] transition-colors"
                />
              </div>

              {/* Bug 专属字段 */}
              {type === 'bug' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-[#8a7e6b] mb-1.5 flex items-center gap-1">
                      <Hash size={12} /> Bug ID（可选）
                    </label>
                    <input
                      value={bugId}
                      onChange={e => setBugId(e.target.value)}
                      placeholder="如 BUG-2024-001"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8a7e6b] mb-1.5 flex items-center gap-1">
                      <Link size={12} /> 关联页面
                    </label>
                    <input
                      value={page}
                      onChange={e => setPage(e.target.value)}
                      placeholder="如：人物 / 种植"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581] transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#8a7e6b] mb-1.5 flex items-center gap-1">
                      <ListOrdered size={12} /> 复现步骤
                    </label>
                    <textarea
                      value={steps}
                      onChange={e => setSteps(e.target.value)}
                      placeholder="1. 打开页面...\n2. 点击按钮...\n3. 出现错误..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf6ef] border border-[#e8e0d5] text-sm outline-none focus:border-[#aed581] resize-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* 描述 */}
              <div className="mb-5">
                <label className="text-xs text-[#8a7e6b] mb-1.5 block">详细描述</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="请详细描述..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f3] text-sm outline-none focus:border-[#aed581] resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || loading}
                  className="px-6 py-2.5 rounded-xl bg-[#aed581] text-white font-medium text-sm hover:bg-[#9bc76d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send size={14} /> {loading ? '提交中...' : '提交'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#f1f8e9] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-[#66a85c]" />
              </div>
              <h2 className="text-lg font-bold text-[#3d3428] mb-2">感谢你的反馈！</h2>
              <p className="text-sm text-[#8a7e6b]">我们会认真阅读每一条反馈，持续改进 Wiki 体验。</p>
              <button
                onClick={handleReset}
                className="mt-6 text-sm text-[#66a85c] hover:underline"
              >
                提交新的反馈
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 反馈记录 */
        <div className="space-y-3">
          {historyLoading ? (
            <div className="text-center py-12 text-sm text-[#b8a898]">加载中...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#b8a898]">暂无反馈记录</div>
          ) : (
            history.map((fb) => {
              const st = statusStyle[fb.status];
              const tp = typeStyle[fb.type];
              return (
                <div key={fb.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${tp.bg} ${tp.text} font-medium`}>{tp.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bg} ${st.text} font-medium`}>{st.label}</span>
                    </div>
                    <span className="text-[10px] text-[#b8a898]">{fb.time}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#3d3428] mb-1">{fb.title}</h3>
                  <p className="text-xs text-[#6b5d4d] mb-2 whitespace-pre-wrap">{fb.content}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
