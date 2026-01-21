import express from "express";
import "dotenv/config";
import fetch from "node-fetch";
import cors from "cors";
import pool from "./config/db.js" ;
import authRoutes from "./routes/auth.js";
import auth from "./middleware/authmd.js";
import base64Data from "base64-arraybuffer";
import cookieParser from "cookie-parser";
import multer from "multer";


const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Only allow MY frontend
  methods: ['GET', 'POST']         // Only allow reading and writing (no deleting)
}));

app.use(cookieParser());

 
const port=process.env.PORT || 8081;

//API route to fetch images from Pixabay
app.get("/api/images", async (req, res) => {
  const query = req.query.q;
  
  try {
    const url = `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "API failed" });
  }
});

// Test protected route
app.get("/api/users", async (req, res) => {
  const db = await pool.query("SELECT current_database()");
console.log("CONNECTED DB:", db.rows[0].current_database);

});


// Auth routes
app.use("/api/auth", authRoutes);


//also check other methods to upload and parse image
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Image upload route

app.post(
  "/api/upload",auth,
  upload.single("image"), // 👈 THIS parses the file
  async (req, res) => {
    try {
      // multer puts file here
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Received file:");
      console.log("Name:", file.originalname);
      console.log("Type:", file.mimetype);
      console.log("Size:", file.size);

      // file.buffer contains raw binary
      const buffer = file.buffer;
      
      // Example: save to Postgres BYTEA
      const photos_remaining = await pool.query(
  "SELECT photos_remaining FROM users WHERE id = $1",
  [req.user.id]
);
      if (photos_remaining.rows[0].photos_remaining <= 0) {
        return res.status(403).json({ message: "No remaining photo uploads to upload max 5 allowed" });
      }

      await pool.query(
  "INSERT INTO images (user_id, image_data)VALUES ($1, $2)",
  [req.user.id, buffer]
);

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
      });
      // Update user's photo counts
      await pool.query(
  "UPDATE users SET photos_uploaded = photos_uploaded + 1, photos_remaining = photos_remaining - 1 WHERE id = $1",
  [req.user.id]
);

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// for user profile data

app.get("/api/userdata", auth, async (req, res) => {
  try {
    const user = await pool.query("SELECT name, email, photos_uploaded, photos_remaining FROM users WHERE id = $1", [req.user.id]);
    res.json(user.rows[0]);
    console.log("Fetched user data for user:", req.user.id);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

//for logout

app.post("/api/logout", auth, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  res.json({ message: "Logged out successfully" });
});

// Fetch uploaded photos

app.post("/api/uploadedphotos", auth, async (req, res) => {
  try {
    const images = await pool.query("SELECT id, image_data FROM images WHERE user_id = $1", [req.user.id]); 
    console.log("Fetched uploaded photos for user:", req.user.id);
    res.json(images.rows);
  } catch (error) {
    console.error("Error fetching uploaded photos:", error);
    res.status(500).json({ error: "Failed to fetch uploaded photos" });
  }
});

// Delete image

app.get("/api/images/delete/:id", auth, async (req, res) => {
    const imageId = req.params.id;
    try {
        // Delete image from database
        const result = await pool.query(
            "DELETE FROM images WHERE id = $1 AND user_id = $2 RETURNING *",
            [imageId, req.user.id]
        );
        console.log("Deleted image:", result.rows[0]);  

        //Update user's photo counts
        await pool.query(
  "UPDATE users SET photos_uploaded = photos_uploaded - 1, photos_remaining = photos_remaining + 1 WHERE id = $1",
  [req.user.id]
);
    }
    catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({ error: "Failed to delete image" });
    }
    res.json({ message: "Image deleted successfully" });
});


      

//activate server

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
