import jwt from "jsonwebtoken";
import "dotenv/config";


function auth(req, res, next) {

  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });
   
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Authenticated user:", decoded);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
export default auth;
