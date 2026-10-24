
const { spawn } = require("child_process");
const path = require("path");

function runAiRecommendations(payload) {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, "../..");
    const pythonCommand = process.env.PYTHON_BIN || "python";

    const child = spawn(
      pythonCommand,
      ["-m", "ai.recommend"],
      {
        cwd: projectRoot,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"]
      }
    );

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      child.kill();
      finish(new Error("AI recommendation process timed out after 5 mins."));
    }, 300000);

    function finish(error, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (error) reject(error);
      else resolve(result);
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      stdout += chunk;

      if (stdout.length > 5_000_000) {
        child.kill();
        finish(new Error("AI output exceeded the allowed size."));
      }
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      finish(error);
    });

    child.on("close", (code) => {
      if (settled) return;

      if (code !== 0) {
        console.error("AI process failed:", stderr.slice(-2000));
        return finish(
          new Error("AI recommendation engine failed.")
        );
      }

      try {
        const result = JSON.parse(stdout);

        if (!Array.isArray(result.recommendations)) {
          throw new Error("Missing recommendations array.");
        }

        finish(null, result);
      } catch (error) {
        finish(new Error("AI engine returned invalid JSON."));
      }
    });

    child.stdin.on("error", (error) => {
      if (error.code !== "EPIPE") finish(error);
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

module.exports = { runAiRecommendations };
