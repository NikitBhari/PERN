import { useRef, useState } from "react";

/* ✅ DEFINE STYLES FIRST */
const styles = {
  page: {
    height: "100vh",
    backgroundColor: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 360,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: 20,
  },
  preview: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  selectBtn: {
    padding: "10px 16px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  uploadBtn: {
    padding: "10px 16px",
    borderRadius: 6,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
  },
};

export default function UploadImage() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please login to upload images");
          return;
        }
        if (response.status === 403) {
        alert("No remaining photo uploads. Maximum 5 allowed.");
        return;}
        throw new Error("Upload failed");
      }
      

      await response.json();
      alert("Image uploaded successfully!");

      setPreview(null);
      setFile(null);
      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Upload Image</h2>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {preview && <img src={preview} alt="Preview" style={styles.preview} />}

        <div style={styles.actions}>
          <button style={styles.selectBtn} onClick={openFilePicker}>
            Choose Image
          </button>

          <button
            style={{
              ...styles.uploadBtn,
              opacity: !file || uploading ? 0.6 : 1,
            }}
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
