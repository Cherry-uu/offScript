// 
import { useState } from "react";
import Starfield from "./components/Starfield";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import AuthPage from "./components/AuthPage";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import RejectedPanel from "./components/RejectedPanel";
import Comparison from "./components/Comparison";
import { fetchRecommendations } from "./api";
import { REQUIRE_LOGIN } from "./config";
import "./App.css";

// Top level: decides which page to show and holds the search + login state.
export default function App() {
    // Start on the login page when login is required
  const [page, setPage] = useState(REQUIRE_LOGIN ? "auth" : "landing"); // "landing" | "auth" | "finder"// "landing" | "auth" | "finder"
  const [user, setUser] = useState(null);      // logged-in email, or null
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Go to a page. Opening the finder while logged out sends you to login.
    function go(target) {
    const needsLogin = target === "finder" && REQUIRE_LOGIN && !user;
    setPage(needsLogin ? "auth" : target);
  }

  function handleLogin(email) {
    setUser(email);
        setPage("landing"); // landing page opens right after login
  }

  function handleLogout() {
    setUser(null);
    setData(null);
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
            <Navbar page={page} user={user} locked={REQUIRE_LOGIN && !user} onNavigate={go} onLogout={handleLogout} />

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
    </>
  );
}