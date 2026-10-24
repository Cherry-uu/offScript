import { useState } from "react";
import { signUp, logIn } from "../auth";

// One form with two modes: log in or sign up.
export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isSignup && password !== confirm) throw new Error("Passwords do not match.");
      // Signing up also logs the user in
      onSuccess(isSignup ? signUp(email, password) : logIn(email, password));
    } catch (err) {
      setError(err.message);
    }
  }

  function switchMode(e) {
    e.preventDefault();
    setMode(isSignup ? "login" : "signup");
    setError("");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="auth-wrap">
      <form className="search-form auth-card" onSubmit={handleSubmit}>
        <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-note">Demo sign-in: accounts reset when the page is refreshed.</p>

        <input
          type="email"
          placeholder="Gmail address (name@gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type={showPass ? "text" : "password"}
          placeholder={isSignup ? "Set a password (8+ characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isSignup && (
          <input
            type={showPass ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        )}

        <label className="show-pass-row">
          <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} />
          Show password
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">{isSignup ? "Sign up" : "Log in"}</button>

        <p className="auth-note">
          {isSignup ? "Already have an account? " : "New here? "}
          <a href="#" onClick={switchMode}>{isSignup ? "Log in" : "Create an account"}</a>
        </p>
      </form>
    </div>
  );
}