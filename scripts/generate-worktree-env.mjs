import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { DEFAULT_PROJECT_NAME, normalizeBranchToDatabase } from "./worktree-config.mjs";

function getCurrentBranch() {
  return execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  }).trim();
}

function parseArgs(args) {
  const parsed = {
    branch: "",
    output: ".env.worktree",
    force: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--branch") {
      parsed.branch = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--output") {
      parsed.output = args[index + 1] ?? parsed.output;
      index += 1;
      continue;
    }

    if (arg === "--force") {
      parsed.force = true;
    }
  }

  return parsed;
}

const options = parseArgs(process.argv.slice(2));
const branch = options.branch || getCurrentBranch();
const database = normalizeBranchToDatabase(branch);

if (existsSync(options.output) && !options.force) {
  throw new Error(
    `${basename(options.output)} already exists. Re-run with --force to overwrite.`,
  );
}

const content = [
  `COMPOSE_PROJECT_NAME=${DEFAULT_PROJECT_NAME}`,
  `DB_DATABASE=${database}`,
  `APP_KEY=base64:${randomBytes(32).toString("base64")}`,
  "",
].join("\n");

writeFileSync(options.output, content, "utf8");

process.stdout.write(
  `Generated ${options.output} for branch ${branch} with DB_DATABASE=${database}\n`,
);
