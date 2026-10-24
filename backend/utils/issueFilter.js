
function filterEligibleIssues(issues) {
  return issues.filter((issue) => {
    // Must be open and unassigned.
    if (issue.state !== "open" || issue.assignee) {
      return false;
    }

    // Only recommend issues whose availability checks succeeded.
    if (issue.availability?.checked !== true) {
      return false;
    }

    // Exclude potential claims and issues with open linked PRs.
    if (issue.availability.status !== "likely_available") {
      return false;
    }

    if (issue.linked_prs?.some((pr) => pr.state === "open")) {
      return false;
    }

    return true;
  });
}

module.exports = { filterEligibleIssues };
