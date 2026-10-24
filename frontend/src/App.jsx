import { useState } from "react";
import Starfield from "./components/Starfield";
import GlobeBackground from "./components/GlobeBackground";
import Intro from "./components/Intro";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import AuthPage from "./components/AuthPage";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import RejectedPanel from "./components/RejectedPanel";
import Comparison from "./components/Comparison";
import { fetchRecommendations } from "./api";
import { REQUIRE_LOGIN, SHOW_INTRO } from "./config";
import "./App.css";

// Top level: decides which page to show and holds the search + login state.
export default function App() {
  // Start on the login page when login is required
  const [page, setPage] = useState(REQUIRE_LOGIN ? "auth" : "landing"); // "landing" | "auth" | "finder"
  const [user, setUser] = useState(null);   // logged-in email, or null
  const [intro, setIntro] = useState(false); // the intro animation plays only after login
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Go to a page. Logged-out visitors can only see the login page.
  function go(target) {
    setPage(REQUIRE_LOGIN && !user ? "auth" : target);
  }

  function handleLogin(email) {
    setUser(email);
    setPage("landing"); // landing page opens right after login
    if (SHOW_INTRO) setIntro(true); // play the logo animation on top of it
  }

  function handleLogout() {
    setUser(null);
    setData(null);
    setIntro(false);
    setPage("auth");
  }

  async function handleSearch(query) {
    setLoading(true);
    setError("");
    try {
      setData(await fetchRecommendations(query));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Starfield />
      <GlobeBackground />
      <Navbar
        page={page}
        user={user}
        locked={REQUIRE_LOGIN && !user}
        introActive={intro}
        onNavigate={go}
        onLogout={handleLogout}
      />

      {page === "landing" && <Landing onStart={() => go("finder")} />}
      {page === "auth" && <AuthPage onSuccess={handleLogin} />}

      {page === "finder" && (
        <div className="app">
          <h1>Open-Source Contribution Finder</h1>
          <p className="subtitle">Find issues you can actually start on today.</p>
          <SearchForm onSearch={handleSearch} loading={loading} />
          {error && <p className="error">{error}</p>}
          {data && (
            <>
              <div className="results">
                {data.results.map((issue) => (
                  <ResultCard key={issue.id} issue={issue} />
                ))}
              </div>
              <RejectedPanel rejected={data.rejected} />
              <details className="compare">
                <summary>Compare with raw GitHub search</summary>
                <Comparison data={data} />
              </details>
            </>
          )}
        </div>
      )}

      {/* Intro animation sits on top of everything until it finishes */}
      {intro && <Intro onDone={() => setIntro(false)} />}
    </>
  );
}