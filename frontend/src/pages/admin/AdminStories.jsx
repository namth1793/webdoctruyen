import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API = (path, opts = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return Promise.reject(new Error('no token'));
  return axios({ url: `/api/admin${path}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
};

const emptyForm = { title: '', slug: '', author: '', cover_image: '', description: '', status: 'ongoing', total_chapters: 0, category_id: '', genres: '', featured: false };

export default function AdminStories() {
  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    API(`/stories?page=${page}&q=${q}`).then(r => {
      setStories(r.data.stories);
      setTotal(r.data.total);
      setPages(r.data.pages);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [page, q]);
  useEffect(() => { API('/categories').then(r => setCategories(r.data)).catch(() => {}); }, []);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API('/upload', { method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, cover_image: r.data.url }));
    } catch {
      alert('Upload ảnh thất bại. Kiểm tra lại Cloudinary credentials trong .env');
    }
    setUploading(false);
    e.target.value = '';
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s) => {
    setEditing(s.id);
    setForm({ ...s, genres: (JSON.parse(s.genres || '[]')).join(', '), featured: s.featured === 1 });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, genres: form.genres.split(',').map(g => g.trim()).filter(Boolean), featured: form.featured ? 1 : 0, total_chapters: parseInt(form.total_chapters) || 0 };
    try {
      if (editing) await API(`/stories/${editing}`, { method: 'PUT', data: payload });
      else await API('/stories', { method: 'POST', data: payload });
      setShowForm(false);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Lỗi'); }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Xoá truyện "${title}"? Toàn bộ chương, bình luận sẽ bị xoá.`)) return;
    await API(`/stories/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleHidden = async (id) => {
    await API(`/stories/${id}/hidden`, { method: 'PATCH' });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Truyện ({total})</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">+ Thêm truyện</button>
      </div>

      <div className="mb-4">
        <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo tên, tác giả..."
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Truyện</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 hidden md:table-cell">Danh mục</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700 hidden sm:table-cell">Chương</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700 hidden lg:table-cell">Lượt xem</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stories.map(s => (
              <tr key={s.id} className={`hover:bg-gray-50 ${s.hidden ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.cover_image ? (
                      <img src={s.cover_image} alt="" className="w-8 h-[43px] object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-8 h-[43px] bg-gray-100 rounded shrink-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">{s.title}</span>
                        {s.hidden ? <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded shrink-0">Ẩn</span> : null}
                      </div>
                      <div className="text-xs text-gray-500">{s.author}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">{s.category_name || '—'}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600">{s.total_chapters}</td>
                <td className="px-4 py-3 text-center hidden lg:table-cell text-gray-600">{s.views?.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {s.status === 'complete' ? 'Hoàn thành' : 'Đang ra'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/truyen/${s.id}/chuong`} className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors">Chương</Link>
                    <button onClick={() => openEdit(s)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors">Sửa</button>
                    <button onClick={() => toggleHidden(s.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${s.hidden ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s.hidden ? 'Hiện' : 'Ẩn'}
                    </button>
                    <button onClick={() => handleDelete(s.id, s.title)} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors">Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stories.length === 0 && <div className="text-center py-10 text-gray-400">Không có truyện nào</div>}
      </div>

      {pages > 1 && (
        <div className="flex gap-1 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 text-sm rounded-lg ${page === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Sửa truyện' : 'Thêm truyện'}</h2>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <div className="grid grid-cols-2 gap-4">
              {[['title', 'Tên truyện', 'col-span-2'], ['slug', 'Slug (URL)', ''], ['author', 'Tác giả', '']].map(([field, label, cls]) => (
                <div key={field} className={cls}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {/* Ảnh bìa — upload file */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
                {form.cover_image ? (
                  <div className="flex items-start gap-4">
                    <img src={form.cover_image} alt="Ảnh bìa" className="w-20 h-[107px] object-cover rounded-lg border border-gray-200 shadow-sm" />
                    <div className="flex flex-col gap-2 pt-1">
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 transition-colors">
                        {uploading ? 'Đang upload...' : 'Đổi ảnh'}
                      </button>
                      <button type="button" onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                        className="px-4 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Xoá ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-60">
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Đang upload...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Nhấn để chọn ảnh bìa</span>
                        <span className="text-xs opacity-60">PNG, JPG — tối đa 5 MB</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select value={form.category_id || ''} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Chọn --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ongoing">Đang ra</option>
                  <option value="complete">Hoàn thành</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số chương</label>
                <input type="number" value={form.total_chapters || 0} onChange={e => setForm(f => ({ ...f, total_chapters: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input type="checkbox" id="featured" checked={!!form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="featured" className="text-sm text-gray-700">Truyện nổi bật</label>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại (cách nhau bằng dấu phẩy)</label>
                <input value={form.genres || ''} onChange={e => setForm(f => ({ ...f, genres: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ngôn tình, Hiện đại, HE" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving || uploading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-60">
                {saving ? 'Đang lưu...' : uploading ? 'Chờ upload xong...' : 'Lưu'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
