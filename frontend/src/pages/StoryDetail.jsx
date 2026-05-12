import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusLabels = { complete: 'Hoàn thành', ongoing: 'Đang ra' };
const statusColors = { complete: 'bg-green-100 text-green-700', ongoing: 'bg-blue-100 text-blue-700' };

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s trước`;
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 604800) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(d).toLocaleDateString('vi-VN');
}

function StarRating({ score, onRate, myScore }) {
  const [hover, setHover] = useState(0);
  const display = hover || myScore || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i}
          onClick={() => onRate && onRate(i)}
          onMouseEnter={() => onRate && setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl transition-transform ${onRate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}>
          <span className={i <= display ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function StoryDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [totalChapters, setTotalChapters] = useState(0);
  const [chapPage, setChapPage] = useState(1);
  const [chapOrder, setChapOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // Ratings
  const [ratingStats, setRatingStats] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios.get(`/api/stories/${slug}`).then(r => {
      setStory(r.data);
      setBookmarked(r.data.bookmarked);
      setLoading(false);
    }).catch(() => navigate('/'));
  }, [slug]);

  useEffect(() => {
    if (!story) return;
    axios.get(`/api/chapters/${slug}?page=${chapPage}&limit=20`).then(r => {
      setChapters(r.data.chapters);
      setTotalChapters(r.data.total);
    });
  }, [story, chapPage]);

  useEffect(() => {
    // re-fetch when user logs in/out so myScore updates
    axios.get(`/api/ratings/${slug}`).then(r => setRatingStats(r.data)).catch(() => {});
  }, [slug, user?.id]);

  useEffect(() => {
    loadComments();
  }, [slug, commentPage]);

  const loadComments = () => {
    setCommentLoading(true);
    axios.get(`/api/comments/${slug}?page=${commentPage}`).then(r => {
      setComments(r.data.comments);
      setCommentTotal(r.data.total);
    }).finally(() => setCommentLoading(false));
  };

  const displayChapters = chapOrder === 'asc' ? chapters : [...chapters].reverse();

  const handleBookmark = async () => {
    if (!user) return navigate('/dang-nhap');
    setBookmarking(true);
    const r = await axios.post(`/api/stories/${slug}/bookmark`);
    setBookmarked(r.data.bookmarked);
    setBookmarking(false);
  };

  const handleRate = async (score) => {
    if (!user) return navigate('/dang-nhap');
    setRatingLoading(true);
    await axios.post(`/api/ratings/${slug}`, { score }, {});
    const r = await axios.get(`/api/ratings/${slug}`, {});
    setRatingStats(r.data);
    setRatingLoading(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/dang-nhap');
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/comments/${slug}`, { content: commentText }, {});
      setCommentText('');
      setCommentPage(1);
      loadComments();
    } catch {}
    setSubmitting(false);
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('Xoá bình luận này?')) return;
    await axios.delete(`/api/comments/${id}`, {});
    loadComments();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!story) return null;

  const chapTotalPages = Math.ceil(totalChapters / 20);
  const avgScore = ratingStats?.avg ? parseFloat(ratingStats.avg).toFixed(1) : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span>›</span>
        {story.category_slug && (
          <>
            <Link to={`/${story.category_slug}`} className="hover:text-blue-600">{story.category_name}</Link>
            <span>›</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{story.title}</span>
      </nav>

      {/* Story info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0 flex sm:block justify-center">
              <div className="w-32 sm:w-44 rounded-xl overflow-hidden shadow-lg">
                <img src={story.cover_image} alt={story.title}
                  className="w-full aspect-[3/4] object-cover"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${story.slug}/300/400`; }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{story.title}</h1>

              {story.author && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="text-gray-400">Tác giả:</span>{' '}
                  <span className="font-medium text-blue-600">{story.author}</span>
                </p>
              )}

              {/* Rating — interactive inline */}
              {ratingStats !== null && (
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <StarRating myScore={ratingStats.myScore} onRate={ratingLoading ? null : handleRate} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{avgScore}</span>
                  <span className="text-xs text-gray-400">({ratingStats.count} đánh giá)</span>
                  {!user && (
                    <span className="text-xs text-gray-400">· <Link to="/dang-nhap" className="text-blue-600 hover:underline">Đăng nhập</Link> để đánh giá</span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`tag ${statusColors[story.status]}`}>{statusLabels[story.status]}</span>
                {story.category_name && (
                  <Link to={`/${story.category_slug}`} className="tag text-white" style={{ backgroundColor: story.category_color }}>
                    {story.category_name}
                  </Link>
                )}
                {(story.genres || []).map(g => (
                  <Link key={g} to={`/tim-kiem?q=${encodeURIComponent(g)}`}
                    className="tag bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    {g}
                  </Link>
                ))}
              </div>

              {/* Hashtags */}
              {(story.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {story.tags.map(t => (
                    <Link key={t.slug} to={`/tim-kiem?tag=${t.slug}`}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors border border-blue-200 dark:border-blue-800">
                      #{t.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400 mb-5">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  {story.total_chapters} chương
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {story.views?.toLocaleString('vi-VN')} lượt xem
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  {story.favorites?.toLocaleString('vi-VN')}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <Link to={`/doc/${story.slug}/chuong-1`}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl sm:rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Đọc từ đầu
                </Link>
                {story.total_chapters > 1 && (
                  <Link to={`/doc/${story.slug}/chuong-${story.total_chapters}`}
                    className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl sm:rounded-lg transition-colors">
                    Chương mới
                  </Link>
                )}
                <button onClick={handleBookmark} disabled={bookmarking}
                  className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-sm font-medium rounded-xl sm:rounded-lg transition-colors ${bookmarked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
                  <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {bookmarked ? 'Đã lưu' : 'Lưu truyện'}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {story.description && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Giới thiệu</h3>
              <div className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line ${!descExpanded ? 'line-clamp-4' : ''}`}>
                {story.description}
              </div>
              <button onClick={() => setDescExpanded(p => !p)} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                {descExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Danh sách chương
            <span className="text-sm font-normal text-gray-500">({totalChapters} chương)</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setChapOrder('asc')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${chapOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>↑ Cũ nhất</button>
            <button onClick={() => setChapOrder('desc')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${chapOrder === 'desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>↓ Mới nhất</button>
          </div>
        </div>

        {chapTotalPages > 1 && (
          <div className="flex items-center gap-1 p-3 border-b border-gray-100 dark:border-gray-700 flex-wrap">
            {Array.from({ length: chapTotalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setChapPage(p)}
                className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${chapPage === p ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        )}

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayChapters.map(ch => (
            <Link key={ch.id} to={`/doc/${slug}/chuong-${ch.chapter_number}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors group">
              <span className="text-sm text-gray-500 w-20 shrink-0 group-hover:text-blue-600">Chương {ch.chapter_number}</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-700 flex-1">{ch.title || `Chương ${ch.chapter_number}`}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">{timeAgo(ch.updated_at || ch.created_at)}</span>
            </Link>
          ))}
        </div>
        {chapters.length === 0 && <div className="text-center py-10 text-gray-400"><p>Chưa có chương nào</p></div>}
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Bình luận <span className="text-sm font-normal text-gray-400">({commentTotal})</span>
          </h2>
        </div>

        {/* Comment form */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          {user ? (
            <form onSubmit={handleComment} className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Nhập bình luận..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors shrink-0">
                  {submitting ? '...' : 'Gửi'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              <Link to="/dang-nhap" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link> để bình luận
            </p>
          )}
        </div>

        {/* Comment list */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {commentLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {c.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.username}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.content}</p>
              </div>
              {user && user.id === c.user_id && (
                <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-gray-400 hover:text-red-500 shrink-0 self-start mt-1">✕</button>
              )}
            </div>
          ))}
        </div>

        {Math.ceil(commentTotal / 20) > 1 && (
          <div className="flex items-center gap-1 p-3 border-t border-gray-100 dark:border-gray-700">
            {Array.from({ length: Math.ceil(commentTotal / 20) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCommentPage(p)}
                className={`w-8 h-8 text-xs font-medium rounded-lg ${commentPage === p ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
