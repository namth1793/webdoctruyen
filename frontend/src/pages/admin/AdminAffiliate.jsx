import { useEffect, useState } from 'react';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const empty = { name: '', url: '', description: '' };

export default function AdminAffiliate() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('2');
  const [stepSaving, setStepSaving] = useState(false);

  const load = () => API('/affiliate').then(r => setLinks(r.data)).catch(() => {});

  useEffect(() => {
    load();
    API('/settings').then(r => {
      if (r.data?.affiliate_step) setStep(String(r.data.affiliate_step));
    }).catch(() => {});
  }, []);

  const saveStep = async () => {
    const val = parseInt(step);
    if (isNaN(val) || val < 1) return alert('Bước nhảy phải là số nguyên ≥ 1');
    setStepSaving(true);
    try {
      await API('/settings', { method: 'PUT', data: { affiliate_step: String(val) } });
    } catch { alert('Lưu thất bại'); }
    setStepSaving(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return alert('Vui lòng nhập tên và URL');
    setSaving(true);
    try {
      if (editing) await API(`/affiliate/${editing}`, { method: 'PUT', data: form });
      else await API('/affiliate', { method: 'POST', data: form });
      setForm(empty);
      setEditing(null);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const startEdit = (l) => {
    setEditing(l.id);
    setForm({ name: l.name, url: l.url, description: l.description || '' });
  };

  const cancelEdit = () => { setEditing(null); setForm(empty); };

  const toggleActive = async (link) => {
    await API(`/affiliate/${link.id}`, { method: 'PUT', data: { ...link, active: link.active ? 0 : 1 } });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Xoá link này?')) return;
    await API(`/affiliate/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Affiliate Links</h1>
      <p className="text-sm text-gray-500 mb-6">
        Mỗi lần user đọc chương theo bước nhảy, web hiện <strong>1 link ngẫu nhiên</strong> từ danh sách active.
      </p>

      {/* Bước nhảy */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6 flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">Bước nhảy</p>
          <p className="text-xs text-gray-500">= 2 → ch. 2,4,6,8... &nbsp;|&nbsp; = 3 → ch. 2,5,8,11...</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input type="number" min="1" value={step} onChange={e => setStep(e.target.value)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={saveStep} disabled={stepSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
            {stepSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Form thêm / sửa link ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm self-start">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Sửa link' : 'Thêm link mới'}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên hiển thị</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mua sắm tại Shopee" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL affiliate</label>
              <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://shope.ee/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả (tuỳ chọn)</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghé Shopee ủng hộ web nhé!" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60 transition-colors">
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : '+ Thêm link'}
            </button>
            {editing && (
              <button onClick={cancelEdit}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
            )}
          </div>
        </div>

        {/* ── Danh sách link ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden self-start">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Danh sách link</span>
            <span className="ml-2 text-xs text-gray-400">{links.length} link</span>
          </div>

          {links.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-400">Chưa có link nào</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {links.map(l => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${l.active ? 'bg-green-500' : 'bg-gray-300'}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{l.name}</p>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block">{l.url}</a>
                    <p className="text-xs text-gray-400 mt-0.5">Clicks: {(l.clicks || 0).toLocaleString('vi-VN')}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => startEdit(l)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                      Sửa
                    </button>
                    <button onClick={() => toggleActive(l)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        l.active
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                      {l.active ? 'Ẩn' : 'Hiện'}
                    </button>
                    <button onClick={() => handleDelete(l.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                      Xoá
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
