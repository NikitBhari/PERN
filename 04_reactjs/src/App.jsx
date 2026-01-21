import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PixabaySafe from "./pages/dashboard.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Login/Register.jsx";
import UploadImage from "./pages/uploadImage.jsx";
import Profile from "./pages/Profile.jsx";
import ViewUpload from "./pages/viewupload.jsx";  

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/login" element={<Login />} />
        {/* remove issue of going back at login */}
        <Route path="/register" element={<Register />} />

        <Route path="/upload" element={<UploadImage />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/uploadedphotos" element={<ViewUpload />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<PixabaySafe />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
