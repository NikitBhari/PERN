import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      alert("Registration successful! Please login.");

      // Navigate to login page but no back option
      navigate("/login", { replace: true });


    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={title}>Create Account</h2>

        <form onSubmit={submit}>
          <input
            style={input}
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            style={input}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            style={input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <button
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
            type="submit"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={footer}>
          Already have an account?{" "}

          {/* ✅ Use Link component for navigation  but no going back */}
          <Link to="/login" replace>Login</Link>

        </p>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "radial-gradient(circle at top, #0f172a, #020617)",
};

const card = {
  width: 380,
  padding: 40,
  borderRadius: 18,
  background: "rgba(30,41,59,0.9)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  border: "1px solid rgba(59,130,246,0.3)",
};

const title = {
  textAlign: "center",
  marginBottom: 30,
  marginLeft:20,
  color: "#e5e7eb",
  letterSpacing: 1,
};

const input = {
  width: "98%",
  padding: "12px",
  marginBottom: 18,
  marginLeft:0,
  borderRadius: 10,
  border: "1px solid rgba(59,130,246,0.4)",
  background: "rgba(15,23,42,0.7)",
  color: "white",
  outline: "none",
  fontSize: 15,
};

const button = {
  width: "104%",
  padding: "14px",
  marginLeft:0,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  color: "white",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginTop: 10,
};

const footer = {
  marginTop: 20,
  textAlign: "center",
  color: "rgba(255,255,255,0.6)",
};

const link = {
  color: "#3b82f6",
  fontWeight: 600,
  textDecoration: "none",
};
