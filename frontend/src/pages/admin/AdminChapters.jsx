import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

export default function AdminChapters() {
  const { storyId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [story, setStory] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ chapter_number: '', title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    API(`/chapters/${storyId}`).then(r => {
      setChapters(r.data.chapters);
      setStory(r.data.story);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [storyId]);

  const openAdd = () => {
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1;
    setEditing(null);
    setForm({ chapter_number: nextNum, title: '', content: '' });
    setShowForm(true);
  };

  const openEdit = (ch) => {
    setEditing(ch.id);
    setForm({ chapter_number: ch.chapter_number, title: ch.title || '', content: ch.content || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await API(`/chapters/${editing}`, { method: 'PUT', data: { title: form.title, content: form.content } });
      else await API(`/chapters/${storyId}`, { method: 'POST', data: form });
      setShowForm(false);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id, num) => {
    if (!confirm(`Xoá chương ${num}?`)) return;
    await API(`/chapters/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/admin/truyen" className="text-sm text-gray-500 hover:text-gray-700">← Truyện</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900 truncate">{story?.title || 'Chương'}</h1>
        <span className="text-sm text-gray-500">({chapters.length} chương)</span>
        <button onClick={openAdd} className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shrink-0">+ Thêm chương</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700 w-24">Số chương</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Tiêu đề</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700 hidden sm:table-cell">Lượt xem</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chapters.map(ch => (
              <tr key={ch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-medium">Ch. {ch.chapter_number}</td>
                <td className="px-4 py-3 text-gray-900 truncate max-w-xs">{ch.title || `Chương ${ch.chapter_number}`}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-500">{ch.views?.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(ch)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded">Sửa</button>
                    <button onClick={() => handleDelete(ch.id, ch.chapter_number)} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {chapters.length === 0 && <div className="text-center py-10 text-gray-400">Chưa có chương nào</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Sửa chương' : 'Thêm chương mới'}</h2>
            <div className="space-y-4">
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số chương</label>
                  <input type="number" value={form.chapter_number} onChange={e => setForm(f => ({ ...f, chapter_number: parseInt(e.target.value) }))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chương</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Chương ${form.chapter_number}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={18}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                  placeholder="Nhập nội dung chương..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Lưu chương'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
