import { Link } from 'react-router-dom';

const statusLabels = { complete: 'Hoàn thành', ongoing: 'Đang ra' };
const statusColors = {
  complete: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  ongoing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function StoryCardGrid({ story }) {
  return (
    <Link to={`/truyen/${story.slug}`} className="group flex flex-col">

      {/* ── Fan effect wraps image only ── */}
      <div className="story-fan">
        {/* Back pages */}
        <div className="fan-page fan-page-left" />
        <div className="fan-page fan-page-right" />

        {/* Main cover card */}
        <div className="fan-main aspect-[3/4] bg-gray-100 dark:bg-gray-700 shadow-md">
          <img
            src={story.cover_image}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => { e.target.src = `https://picsum.photos/seed/${story.slug}/300/400`; }}
          />
          {/* Status badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow ${
              story.status === 'complete' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {statusLabels[story.status]}
            </span>
          </div>
          {/* Hover overlay: title + chapter */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
            <p className="text-white font-black text-sm leading-tight line-clamp-2 uppercase drop-shadow-lg">
              {story.title}
            </p>
            <p className="text-blue-300 text-xs mt-1 font-semibold">
              Chương {story.total_chapters}
            </p>
          </div>
        </div>
      </div>

      {/* ── Text info below ── */}
      <div className="pt-2 px-0.5 flex flex-col gap-1">
        <h3 className="font-semibold text-sm text-white drop-shadow line-clamp-2 group-hover:text-blue-200 transition-colors leading-snug">
          {story.title}
        </h3>
        {story.author && (
          <p className="text-xs text-white/70 truncate">{story.author}</p>
        )}
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
            {story.total_chapters} ch
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {story.views >= 1000 ? `${(story.views / 1000).toFixed(1)}k` : story.views}
          </span>
        </div>
      </div>

    </Link>
  );
}

export function StoryCardLatest({ story }) {
  return (
    <Link to={`/truyen/${story.slug}`}
      className="group flex items-center gap-2.5 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-1 px-1 rounded transition-colors">
      <img
        src={story.cover_image}
        alt={story.title}
        className="w-9 h-12 object-cover rounded-md flex-shrink-0"
        loading="lazy"
        onError={e => { e.target.src = `https://picsum.photos/seed/${story.slug}/300/400`; }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug">{story.title}</h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Ch.{story.latest_chapter || story.total_chapters}
          </span>
          <span className="text-[11px] text-gray-400">·</span>
          <span className="text-[11px] text-gray-400">{timeAgo(story.chapter_updated || story.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}

export function StoryCardRow({ story }) {
  return (
    <Link to={`/truyen/${story.slug}`} className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <img
        src={story.cover_image}
        alt={story.title}
        className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
        onError={e => { e.target.src = `https://picsum.photos/seed/${story.slug}/300/400`; }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 line-clamp-2 leading-snug">{story.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{story.author}</p>
      </div>
    </Link>
  );
}
