// // // // Top bar. Section links only show on the landing page.
// // // export default function Navbar({ page, onNavigate }) {
// // //   return (
// // //     <nav className="navbar">
// // //       <button className="brand" onClick={() => onNavigate("landing")}>
// // //         🧭 Contribution Finder
// // //       </button>
// // //       <div className="nav-links">
// // //         {page === "landing" && (
// // //           <>
// // //             <a href="#how">How it works</a>
// // //             <a href="#features">Features</a>
// // //             <a href="#platforms">Platforms</a>
// // //           </>
// // //         )}
// // //         <button className="nav-cta" onClick={() => onNavigate("finder")}>
// // //           Open finder
// // //         </button>
// // //       </div>
// // //     </nav>
// // //   );
// // // }
// // // Top bar. Section links only show on the landing page.
// // export default function Navbar({ page, onNavigate }) {
// //   return (
// //     <nav className="navbar">
// //       <button className="brand" onClick={() => onNavigate("landing")}>
// //         <span className="logo">{"{}"}</span>
// //         Contribution Finder
// //       </button>
// //       <div className="nav-links">
// //         {page === "landing" && (
// //           <>
// //             <a href="#how">How it works</a>
// //             <a href="#features">Features</a>
// //             <a href="#platforms">Platforms</a>
// //           </>
// //         )}
// //         <button className="nav-cta" onClick={() => onNavigate("finder")}>
// //           Open finder
// //         </button>
// //       </div>
// //     </nav>
// //   );
// // }
// // Top bar. Shows Log in, or the user's email and Log out.
// export default function Navbar({ page, user, onNavigate, onLogout }) {
//   return (
//     <nav className="navbar">
//       <button className="brand" onClick={() => onNavigate("landing")}>
//         <span className="logo">{"{}"}</span>
//         Contribution Finder
//       </button>
//       <div className="nav-links">
//         {page === "landing" && (
//           <>
//             <a href="#how">How it works</a>
//             <a href="#features">Features</a>
//             <a href="#platforms">Platforms</a>
//           </>
//         )}
//         <button className="nav-link-btn" onClick={() => onNavigate("finder")}>
//           Open finder
//         </button>
//         {user ? (
//           <>
//             <span className="user-email">{user}</span>
//             <button className="ghost-btn small" onClick={onLogout}>Log out</button>
//           </>
//         ) : (
//           <button className="nav-cta" onClick={() => onNavigate("auth")}>Log in</button>
//         )}
//       </div>
//     </nav>
//   );
// }
// Top bar. While logged out ("locked") only the brand shows.
// After login it shows the links, the user's email and Log out.
export default function Navbar({ page, user, locked, onNavigate, onLogout }) {
  return (
    <nav className="navbar">
      <button className="brand" onClick={() => onNavigate("landing")}>
        <span className="logo">{"{}"}</span>
        Contribution Finder
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