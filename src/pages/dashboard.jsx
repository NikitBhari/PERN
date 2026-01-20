import { SignalZero } from "lucide-react";
import { useEffect, useState } from "react";
import UploadImage from "./uploadImage";
import {  useNavigate } from "react-router-dom";


//progressive image search dashboard

function ProgressiveImage({ preview, full, alt, onClick }) {
  const [src, setSrc] = useState(preview);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = full;

    img.onload = () => {
      setSrc(full);      // swap image
      setLoaded(true);  // mark loaded
    };
  }, [full]);

  return (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      style={{
        width: "100%",
        height: 300,
        objectFit: "cover",
        borderRadius: 8,
        cursor: "pointer",
        transition: "filter 0.1s ease, opacity 0.3s",
        filter: loaded ? "blur(0px)" : "blur(6px)",
      }}
    />
  );
}

// Header Component (inline to avoid import issues)
function Header({ searchValue, onSearchChange, showSearch = false }) {
  const navigate = useNavigate();
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "15px 40px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      left:0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ fontSize: 24, fontWeight: 700, color: "#4CAF50" }}>
        ImSearch
      </div>

      {/* Search Bar (conditional) */}
      {showSearch && (
        <input
          type="text"
          value={searchValue}
          placeholder="Search images (e.g. nature, cars, flowers)"
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 500,
            padding: 10,
            fontSize: 15,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginLeft: 20,
            marginRight: 20,
          }}
        />
      )}

      {/* Profile & Upload */}
      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
        <button onClick={() => navigate("/upload")} style={{
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          fontSize: 14,
        }}>
          📤 Upload
        </button>
        <button onClick={() => navigate("/profile")} style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}>
          👤
        </button>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("Nature");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(() => {
      fetchImages();
    }, 800);

    return () => clearTimeout(timer);
  }, [query]);

  // Download image function
  const downloadImage = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSelectedImage(null);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download image");
    }
  };

  // Fetch images from backend
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://10.89.161.91:8081/api/images?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await res.json();
      
      const imagesToSave = (data.hits || []);
      setImages(imagesToSave);
      
      // Update saved images in state (combining with previous)
      setSavedImages(prev => [...prev, ...imagesToSave].slice(-100));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image grid component (reusable)
  const ImageGrid = ({ imageList, title }) => (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ marginBottom: 15, color: "#333", fontSize: 40 }}>{title}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 15,
          padding: 10,
          border: "1px solid #eee",
          borderRadius: 8,
          backgroundColor: "#fafafa",
        }}
      >
        {imageList.map((image, idx) => (
          <div
            key={`${image.id}-${idx}`}
            style={{ position: "relative" }}
          >
            <ProgressiveImage
              preview={image.previewURL}
              full={image.largeImageURL}
              alt={image.tags || "image"}
              onClick={() => setSelectedImage(image)}
            />

          </div>
        ))}
      </div>
      {imageList.length === 0 && <p style={{ color: "#999" }}>No images found</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header with integrated search */}
      <Header 
        searchValue={query}
        onSearchChange={setQuery}
        showSearch={true}
      />
      
      <div style={{ padding: "20px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {/* STATUS MESSAGES */}
        {loading && (
          <div style={{ 
            padding: 15, 
            backgroundColor: "#e3f2fd", 
            borderRadius: 8, 
            marginBottom: 20,
            color: "#1976d2"
          }}>
            Loading images...
          </div>
        )}
        {error && (
          <div style={{ 
            padding: 15, 
            backgroundColor: "#ffebee", 
            borderRadius: 8, 
            marginBottom: 20,
            color: "#c62828"
          }}>
            {error}
          </div>
        )}

        {/* CURRENT SEARCH RESULTS */}
        <ImageGrid  
          imageList={images} 
          title={`${query ? query : 'Nature'} Photos `}
        />

        {/* SAVED IMAGES FROM ALL SEARCHES */}
        {savedImages.length > 0 && (
          <ImageGrid 
            imageList={savedImages} 
            title={`Recently Saved Images (${savedImages.length})`}
          />
        )}
      </div>

      {/* DOWNLOAD MODAL */}
      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 30,
              borderRadius: 10,
              textAlign: "center",
              maxWidth: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.largeImageURL || selectedImage.previewURL}
              alt={selectedImage.tags}
              style={{
                width: "100%",
                maxHeight: 400,
                borderRadius: 8,
                marginBottom: 20,
                objectFit: "contain",
              }}
            />
            <p style={{ marginBottom: 20, color: "#333", fontSize: 16 }}>
              {selectedImage.tags || "Image"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() =>
                  downloadImage(
                    selectedImage.largeImageURL || selectedImage.previewURL, 
                    `image-${selectedImage.id}.jpg`
                  )
                }
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 600,
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
              >
                📥 Download
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 600,
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#da190b"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}