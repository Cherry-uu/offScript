import Mark from "./Mark";

// Top bar. While logged out ("locked") only the brand shows.
// While the intro plays (introActive) the brand is hidden, because the
// flying intro logo lands exactly on the #nav-logo spot.
export default function Navbar({ page, user, locked, introActive, onNavigate, onLogout }) {
  return (
    <nav className="navbar">
      <button className={`brand${introActive ? " is-hidden" : ""}`} onClick={() => onNavigate("landing")}>
        <span id="nav-logo" className="nav-logo"><Mark size={44} small /></span>
        PatchPilot
      </button>

      {!locked && (
        <div className="nav-links">
          {page === "landing" && (
            <>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#platforms">Platforms</a>
            </>
          )}
          <button className="nav-link-btn" onClick={() => onNavigate("finder")}>
            Open finder
          </button>
          {user ? (
            <>
              <span className="user-email">{user}</span>
              <button className="ghost-btn small" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <button className="nav-cta" onClick={() => onNavigate("auth")}>Log in</button>
          )}
        </div>
      )}
    </nav>
  );
}