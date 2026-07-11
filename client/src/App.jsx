import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import MovieDetail from "./components/MovieDetailPage";
import Dashboad from "./components/Dashborad/Dashboad";
import MovieList from "./components/Dashborad/MovieList";
import EditMovie from "./components/Dashborad/EditMovie";
import AppDash from "./components/AppDash";
import ContactForm from "./pages/Contact";
import AdminContactList from "./components/Dashborad/AdminContactList";
import AdminComments from "./components/Dashborad/AdminComments";
import AdminNavbarMenu from "./components/Dashborad/AdminNavbarMenu";
import AdminSiteSettings from "./components/Dashborad/AdminSiteSettings";
import PrivateRoute from "./components/Dashborad/PrivateRoute";
import Footer from "./components/Footer";

/**
 * PublicLayout — wraps all public-facing pages with a shared Footer.
 * Admin and Signin pages do NOT use this layout.
 */
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Outlet />
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* ── Public pages — all get Footer via PublicLayout ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        {/* Legacy _id route (backward compat) */}
        <Route path="/moviedetail/:id" element={<MovieDetail />} />
        {/* Pretty shareable URL: /movie/title-language-slug */}
        <Route path="/movie/:prettySlug" element={<MovieDetail />} />
        <Route path="/contact" element={<ContactForm />} />
      </Route>

      {/* ── Signin — no footer (admin login page) ── */}
      <Route path="/signin" element={<Signin />} />

      {/* ── Admin dashboard — no footer ── */}
      <Route
        path="/admin-db"
        element={
          <PrivateRoute>
            <AppDash />
          </PrivateRoute>
        }
      >
        <Route path="dashboard"     element={<Dashboad />} />
        <Route path="movies"        element={<MovieList />} />
        <Route path="edit/:id"      element={<EditMovie />} />
        <Route path="admin-contect" element={<AdminContactList />} />
        <Route path="comments"      element={<AdminComments />} />
        <Route path="navbar-menu"   element={<AdminNavbarMenu />} />
        <Route path="site-settings" element={<AdminSiteSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
