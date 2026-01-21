import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    photos_uploaded: 0,
    photos_remaining: 5,
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user data properly
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/userdata", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Not logged in");
        }

        const userdata = await response.json();
        setUserData(userdata);
        setLoggedIn(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Proper logout (cookie-based)
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  // 🔄 Loading state
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  }

  return (
    <div className="settings-page">
      {loggedIn ? (
        <div className="profile-card">
          <h2>User Profile</h2>

          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Photos Uploaded:</strong> {userData.photos_uploaded}</p>
          <p><strong>Remaining Photos:</strong> {userData.photos_remaining}</p>

          {/* ✅ NEW BUTTON: Navigate to uploaded photos page */}
          <button
            className="view-photos-btn"
            onClick={() => navigate("/uploadedphotos")}
            style={{fontSize: '16px', padding: '10px 15px', marginTop: '10px' ,borderRadius:'5px', cursor:'pointer',animation:'fadeIn 0.5s'}}
          >
            View Uploaded Photos
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", paddingTop: "50px"  }}>
          <p>Please log in to view your profile.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}
