import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import {
  DEFAULT_PROJECT_NAME,
  normalizeBranchToDatabase,
  resolvePreset,
} from "./worktree-config.mjs";

function parseArgs(args) {
  const parsed = {
    feature: "",
    branch: "",
    path: "",
    base: "origin/main",
    forceEnv: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--feature") {
      parsed.feature = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--branch") {
      parsed.branch = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--path") {
      parsed.path = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--base") {
      parsed.base = args[index + 1] ?? parsed.base;
      index += 1;
      continue;
    }

    if (arg === "--force-env") {
      parsed.forceEnv = true;
    }
  }

  return parsed;
}

function runGit(args, options = {}) {
  const result = execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  return typeof result === "string" ? result.trim() : "";
}

function ensureParentDirectory(targetPath) {
  mkdirSync(dirname(targetPath), { recursive: true });
}

function createEnvFile(targetPath, branch, database, force) {
  const envPath = resolve(targetPath, ".env.worktree");

  if (existsSync(envPath) && !force) {
    throw new Error(`${envPath} already exists. Re-run with --force-env to overwrite.`);
  }

  const content = [
    `COMPOSE_PROJECT_NAME=${DEFAULT_PROJECT_NAME}`,
    `DB_DATABASE=${database}`,
    "",
  ].join("\n");

  writeFileSync(envPath, content, "utf8");
  return envPath;
}

const options = parseArgs(process.argv.slice(2));

if (!options.feature && !options.branch) {
  throw new Error("Specify either --feature <preset> or --branch <branch-name>.");
}

let branch = options.branch;
let database = "";
let targetPath = options.path;

if (options.feature) {
  const preset = resolvePreset(options.feature);
  branch = branch || preset.branch;
  database = preset.database;
  targetPath = targetPath || preset.directoryName;
}

if (!branch) {
  throw new Error("Branch name could not be determined.");
}

if (!database) {
  database = normalizeBranchToDatabase(branch);
}

if (!targetPath) {
  const defaultDirectory = branch
    .replace(/^feature\//, "ai-delivery-assistant-")
    .replace(/^main$/, "ai-delivery-assistant-main")
    .replace(/[^a-zA-Z0-9._-]+/g, "-");
  targetPath = defaultDirectory;
}

const resolvedTargetPath = isAbsolute(targetPath) ? targetPath : resolve("..", targetPath);

if (existsSync(resolvedTargetPath)) {
  throw new Error(`Target path already exists: ${resolvedTargetPath}`);
}

ensureParentDirectory(resolvedTargetPath);

runGit(["fetch", "origin"]);
runGit(["worktree", "add", resolvedTargetPath, "-b", branch, options.base], { stdio: "inherit" });

const envPath = createEnvFile(resolvedTargetPath, branch, database, options.forceEnv);

process.stdout.write(
  [
    `Created worktree: ${resolvedTargetPath}`,
    `Branch: ${branch}`,
    `Base: ${options.base}`,
    `DB_DATABASE: ${database}`,
    `Generated env file: ${envPath}`,
  ].join("\n") + "\n",
);
