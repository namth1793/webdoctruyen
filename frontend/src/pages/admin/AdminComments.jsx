import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s trước`;
  if (s < 3600) return `${Math.floor(s / 60)}m trước`;
  if (s < 86400) return `${Math.floor(s / 3600)}h trước`;
  return new Date(d).toLocaleDateString('vi-VN');
}

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const load = () => {
    API(`/comments?page=${page}`).then(r => {
      setComments(r.data.comments);
      setTotal(r.data.total);
      setPages(r.data.pages);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Xoá bình luận này?')) return;
    await API(`/comments/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Bình luận ({total})</h1>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{c.username}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <Link to={`/truyen/${c.story_slug}`} target="_blank" className="text-xs text-blue-600 hover:underline truncate">{c.story_title}</Link>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
              </div>
              <button onClick={() => handleDelete(c.id)}
                className="shrink-0 px-3 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors">
                Xoá
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có bình luận nào</div>}
      </div>

      {pages > 1 && (
        <div className="flex gap-1 mt-5">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 text-sm rounded-lg ${page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
