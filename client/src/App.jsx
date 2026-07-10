import { Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import MovieDetail from "./components/MovieDetailPage";
import Dashboad from "./components/Dashborad/Dashboad";
import MovieList from "./components/Dashborad/MovieList";
import EditMovie from "./components/Dashborad/EditMovie";
import AppDash from "./components/AppDash";
import ContactForm from "./pages/Contact";
import AdminContactList from "./components/Dashborad/AdminContactList";
import PrivateRoute from "./components/Dashborad/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/moviedetail/:id" element={<MovieDetail />} />
      <Route path="/contact" element={<ContactForm />} />
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
      </Route>
    </Routes>
  );
}

export default App;
