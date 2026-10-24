// One place to change the backend address and switch between mock and real data.
export const API_BASE_URL = "http://localhost:8000";
export const USE_MOCK = true; // set to false once Vibha's backend is ready

// Platforms shown as checkboxes. "id" is what we send to /api/recommend.
export const PLATFORMS = [
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "codeberg", label: "Codeberg" },
  { id: "gitea", label: "Gitea" },
  { id: "sourcehut", label: "SourceHut" },
];
// Set to false while developing so you don't have to log in every refresh.
export const REQUIRE_LOGIN = true;