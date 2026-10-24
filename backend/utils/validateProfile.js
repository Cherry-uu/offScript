
const VALID_EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced"
];

function validateProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return { valid: false, message: "A valid profile is required." };
  }

  const arrayFields = [
    "skills",
    "preferred_languages",
    "interests"
  ];

  for (const field of arrayFields) {
    if (
      !Array.isArray(profile[field]) ||
      !profile[field].every(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    ) {
      return {
        valid: false,
        message: `${field} must be an array of non-empty strings.`
      };
    }
  }

  if (
    !VALID_EXPERIENCE_LEVELS.includes(profile.experience_level)
  ) {
    return {
      valid: false,
      message: "experience_level must be beginner, intermediate, or advanced."
    };
  }

  return { valid: true };
}

module.exports = { validateProfile };
