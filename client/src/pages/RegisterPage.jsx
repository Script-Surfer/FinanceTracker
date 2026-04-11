import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "All fields are required.";
    }
    if (form.password.length < 6) {
      return "Password length must be at least 6 characters.";
    }
    if (form.password != form.confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user); // store token + set user in context
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.sub}>Personal Finance Tracker</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field
            label="Full name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

// ── reusable field component ──────────────────────────────
const Field = ({ label, name, type, value, onChange }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      style={styles.input}
    />
  </div>
);

// ── inline styles (no CSS file needed for now) ────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 400,
    border: "1px solid #e5e5e5",
  },
  title: { margin: "0 0 4px", fontSize: 22, fontWeight: 600 },
  sub: { margin: "0 0 24px", fontSize: 13, color: "#888" },
  form: { display: "flex", flexDirection: "column" },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 5,
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  },
  btn: {
    marginTop: 8,
    padding: "10px",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  footer: { textAlign: "center", fontSize: 13, color: "#666", marginTop: 20 },
};

export default RegisterPage;
