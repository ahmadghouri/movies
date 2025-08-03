import { Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/signup";
import Home from "./pages/Home";
import MovieDetail from "./components/MovieDetailPage";
import Dashboad from "./components/Dashborad/Dashboad";
// import Navbar from "./components/Dashborad/Navbar";
import AppDash from "./components/AppDash";
import ContactForm from "./pages/Contact";
import AdminContactList from "./components/Dashborad/AdminContactList";
import PrivateRoute from "./components/Dashborad/PrivateRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
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
          <Route path="dashboard" element={<Dashboad />} />
          <Route path="admin-contect" element={<AdminContactList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
