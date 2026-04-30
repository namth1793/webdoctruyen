import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import StoryDetail from './pages/StoryDetail';
import ChapterRead from './pages/ChapterRead';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookmarksPage from './pages/BookmarksPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStories from './pages/admin/AdminStories';
import AdminChapters from './pages/admin/AdminChapters';
import AdminComments from './pages/admin/AdminComments';
import AdminCategories from './pages/admin/AdminCategories';
import AdminTags from './pages/admin/AdminTags';
import AdminAffiliate from './pages/admin/AdminAffiliate';

export default function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Reading page (no main layout) */}
            <Route path="/doc/:storySlug/chuong-:chapterNum" element={<ChapterRead />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="truyen" element={<AdminStories />} />
              <Route path="truyen/:storyId/chuong" element={<AdminChapters />} />
              <Route path="binh-luan" element={<AdminComments />} />
              <Route path="danh-muc" element={<AdminCategories />} />
              <Route path="tags" element={<AdminTags />} />
              <Route path="affiliate" element={<AdminAffiliate />} />
            </Route>

            {/* Public routes with main layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/ngon-tinh" element={<CategoryPage category="ngon-tinh" />} />
              <Route path="/dam-my" element={<CategoryPage category="dam-my" />} />
              <Route path="/tieu-thuyet" element={<CategoryPage category="tieu-thuyet" />} />
              <Route path="/the-loai/:genre" element={<CategoryPage />} />
              <Route path="/truyen/:slug" element={<StoryDetail />} />
              <Route path="/tim-kiem" element={<SearchPage />} />
              <Route path="/dang-nhap" element={<LoginPage />} />
              <Route path="/dang-ky" element={<RegisterPage />} />
              <Route path="/tu-truyen" element={<BookmarksPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </AuthProvider>
  );
}
