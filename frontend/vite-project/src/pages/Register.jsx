import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !pass.trim() || !phone.trim()) {
      setError("All fields are required.");
      return;
    }

    if (pass.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/customers/register", {
        fullName: name,
        email: email,
        password: pass,
        phone: phone,
      });

      if (response.status === 201 || response.data?.success) {
        navigate("/login", {
          state: {
            successMessage: "Account created successfully! Please log in.",
            registeredEmail: email,
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <span style={styles.brandBadge}>🛍️ ShopKart</span>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Enter your details below to register on ShopKart</p>
        </div>

        {error && (
          <div style={styles.errorAlert} role="alert">
            <span style={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
              autoComplete="name"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={styles.input}
              required
              autoComplete="new-password"
            />
            <span style={styles.helperText}>Must be at least 6 characters long</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
              autoComplete="tel"
            />
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "40px 32px",
    textAlign: "left",
    boxSizing: "border-box",
  },
  brandHeader: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
  },
  brandBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  header: {
    marginBottom: "24px",
    textAlign: "center",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  alertIcon: {
    fontSize: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  helperText: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
    transition: "transform 0.1s ease, box-shadow 0.2s ease",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;