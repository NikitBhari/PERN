import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    padding: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 16,
  },
  imageWrapper: {
    position: "relative",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 8,
  },
};

/* ---------------- COMPONENT ---------------- */

export default function ViewUpload() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploadedPhotos = async () => {
      try {
        const response = await fetch("/api/uploadedphotos", {
          method: "POST",
          credentials: "include",
        });

        if (response.status === 401) {
          setLoggedIn(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch uploaded photos");
        }

        const data = await response.json();

        const formattedImages = data.map((img) => {
          const base64 = btoa(
            new Uint8Array(img.image_data.data)
              .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
          );

          return {
            id: img.id,
            src: `data:image/jpeg;base64,${base64}`,
          };
        });

        setImages(formattedImages);
      } catch (error) {
        console.error("Error fetching uploaded photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUploadedPhotos();
  }, []);

  /* ---------------- DELETE HANDLER ---------------- */

  const handleDelete = async (imageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/images/delete/${imageId}`, {
        method: "GET", // ⚠️ should be DELETE ideally
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // ✅ Remove image from UI
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      alert("Image deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete image");
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading your uploaded photos...</p>;
  }

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <p>Please log in to view your uploaded photos.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {images.length === 0 && <p>No uploaded photos yet.</p>}

      {images.map((img) => (
        <div
          key={img.id}
          style={styles.imageWrapper}
          onClick={() => handleDelete(img.id)}
          title="Click to delete image"
        >
          <img src={img.src} alt="Uploaded" style={styles.image} />
        </div>
      ))}
    </div>
  );
}
