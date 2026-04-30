import { useEffect, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const empty = { name: '', url: '', description: '', trigger_after: 3, active: true };

export default function AdminAffiliate() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => API('/affiliate').then(r => setLinks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await API(`/affiliate/${editing}`, { method: 'PUT', data: form });
      else await API('/affiliate', { method: 'POST', data: form });
      setForm(empty); setEditing(null); load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá link này?')) return;
    await API(`/affiliate/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActive = async (link) => {
    await API(`/affiliate/${link.id}`, { method: 'PUT', data: { ...link, active: link.active ? 0 : 1 } });
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Affiliate Links</h1>
      <p className="text-sm text-gray-500 mb-5">Link sẽ hiện popup yêu cầu click sau mỗi N chương đọc. Chỉ 1 link active có hiệu lực.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Sửa link' : 'Thêm link mới'}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Nhận mã VIP miễn phí" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL đích</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/offer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả popup</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhấn để nhận ưu đãi đặc biệt!" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hiện popup sau mỗi N chương</label>
              <input type="number" min={1} max={50} value={form.trigger_after} onChange={e => setForm(p => ({ ...p, trigger_after: parseInt(e.target.value) || 3 }))}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-xs text-gray-500 ml-2">chương</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={!!form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="active" className="text-sm text-gray-700">Kích hoạt ngay</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm link'}
            </button>
            {editing && <button onClick={() => { setForm(empty); setEditing(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>}
          </div>
        </div>

        <div className="space-y-3">
          {links.map(l => (
            <div key={l.id} className={`bg-white rounded-xl border-2 p-4 shadow-sm ${l.active ? 'border-green-400' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{l.name}</span>
                    {l.active ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Tắt</span>}
                  </div>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{l.url}</a>
                  {l.description && <p className="text-xs text-gray-500 mt-1">{l.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Trigger: {l.trigger_after} chương</span>
                    <span>Clicks: {l.clicks?.toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => toggleActive(l)} className={`px-2 py-1 text-xs rounded ${l.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {l.active ? 'Tắt' : 'Bật'}
                  </button>
                  <button onClick={() => { setEditing(l.id); setForm({ ...l, active: !!l.active }); }} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded">Sửa</button>
                  <button onClick={() => handleDelete(l.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Xoá</button>
                </div>
              </div>
            </div>
          ))}
          {links.length === 0 && <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">Chưa có link nào</div>}
        </div>
      </div>
    </div>
  );
}
