import { useEffect, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const empty = { name: '', slug: '' };

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => API('/tags').then(r => setTags(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const slugify = (str) => str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (editing) await API(`/tags/${editing}`, { method: 'PUT', data });
      else await API('/tags', { method: 'POST', data });
      setForm(empty); setEditing(null); load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xoá tag "${name}"?`)) return;
    await API(`/tags/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Tags</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Sửa tag' : 'Thêm tag'}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên tag</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="HE, BE, Học đường..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (tự động)</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="he, be, hoc-duong..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editing && <button onClick={() => { setForm(empty); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex flex-wrap gap-2 p-4">
            {tags.map(t => (
              <div key={t.id} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 group">
                <span className="text-sm text-gray-700">{t.name}</span>
                <span className="text-xs text-gray-400">({t.story_count})</span>
                <button onClick={() => { setEditing(t.id); setForm(t); }} className="text-blue-500 hover:text-blue-700 text-xs ml-1">✎</button>
                <button onClick={() => handleDelete(t.id, t.name)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            {tags.length === 0 && <div className="text-sm text-gray-400 w-full text-center py-4">Chưa có tag nào</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
