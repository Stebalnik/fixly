import fs from "fs";
import path from "path";

const rootDir = process.cwd();

const snapshotsDir = path.join(rootDir, "_project", "snapshots");
const archiveDir = path.join(snapshotsDir, "archive");

const includeDirs = [
  "src/app",
  "src/components",
  "src/features",
  "src/lib",
  "src/styles",
  "_project/docs",
];

const includeFiles = [
  "package.json",
  "next.config.ts",
  "next.config.js",
  "tsconfig.json",
];

const ignored = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function moveOldSnapshotsToArchive() {
  if (!fs.existsSync(snapshotsDir)) return;

  const files = fs.readdirSync(snapshotsDir);

  for (const file of files) {
    const fullPath = path.join(snapshotsDir, file);

    if (
      file.startsWith("fixly-project-snapshot-") &&
      file.endsWith(".txt")
    ) {
      const archivePath = path.join(archiveDir, file);

      ensureDir(archiveDir);

      fs.renameSync(fullPath, archivePath);
    }
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function walkDirectory(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function getTree(dirPath, prefix = "") {
  if (!fs.existsSync(dirPath)) return "";

  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => !ignored.has(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  let output = "";

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const fullPath = path.join(dirPath, entry.name);

    output += `${prefix}${connector}${entry.name}\n`;

    if (entry.isDirectory()) {
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      output += getTree(fullPath, nextPrefix);
    }
  });

  return output;
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "[Unable to read file]";
  }
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

// === EXECUTION ===

ensureDir(snapshotsDir);
ensureDir(archiveDir);

// 1. перемещаем старые снапшоты
moveOldSnapshotsToArchive();

// 2. создаем новый файл
const today = getTodayDate();
const outputFile = path.join(
  snapshotsDir,
  `fixly-project-snapshot-${today}.txt`
);

let snapshot = "";

snapshot += "# Fixly.work Project Snapshot\n\n";
snapshot += `Generated at: ${new Date().toISOString()}\n\n`;

snapshot += "## Project Tree\n\n";
snapshot += "```txt\n";
snapshot += getTree(rootDir);
snapshot += "```\n\n";

snapshot += "## Files\n\n";

const filesToRead = [];

for (const file of includeFiles) {
  if (exists(file)) {
    filesToRead.push(path.join(rootDir, file));
  }
}

for (const dir of includeDirs) {
  const absoluteDir = path.join(rootDir, dir);
  filesToRead.push(...walkDirectory(absoluteDir));
}

const uniqueFiles = [...new Set(filesToRead)];

for (const filePath of uniqueFiles) {
  const rel = relative(filePath);

  snapshot += `\n\n---\n\n`;
  snapshot += `## File: ${rel}\n\n`;
  snapshot += "```txt\n";
  snapshot += readFileSafe(filePath);
  snapshot += "\n```\n";
}

fs.writeFileSync(outputFile, snapshot, "utf8");

console.log(`✅ New snapshot created: ${outputFile}`);
console.log(`📦 Old snapshots moved to archive`);