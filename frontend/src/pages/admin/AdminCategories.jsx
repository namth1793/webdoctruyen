import { useEffect, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const empty = { name: '', slug: '', description: '', color: '#3b82f6' };

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => API('/categories').then(r => setCats(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await API(`/categories/${editing}`, { method: 'PUT', data: form });
      else await API('/categories', { method: 'POST', data: form });
      setForm(empty); setEditing(null); load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Xoá danh mục "${name}"?`)) return;
    await API(`/categories/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Danh mục</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
          <div className="space-y-3">
            {[['name', 'Tên danh mục'], ['slug', 'Slug'], ['description', 'Mô tả']].map(([f, l]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-9 border border-gray-300 rounded cursor-pointer" />
                <span className="text-sm text-gray-600">{form.color}</span>
              </div>
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

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {cats.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">/{c.slug}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c.id); setForm(c); }} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded">Sửa</button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Xoá</button>
                </div>
              </div>
            ))}
            {cats.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Chưa có danh mục</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
