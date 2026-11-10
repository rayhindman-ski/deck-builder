import { existsSync } from "node:fs";
import { mkdir, readdir, stat, writeFile, link, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function workspaceRoot(): string {
  let dir = process.cwd();
  while (!existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error("Cannot locate the project root.");
    dir = parent;
  }
  return dir;
}

export const deckDirectory = path.join(workspaceRoot(), "doc", "decks");
export const outputPattern = /^replit-example-deck-v([0-9]+)\.pdf$/;

export async function listDeckFiles(directory = deckDirectory) {
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory);
  const outputs = await Promise.all(
    entries.filter((name) => outputPattern.test(name)).map(async (filename) => {
      const info = await stat(path.join(directory, filename));
      if (!info.isFile()) return null;
      return {
        filename,
        version: Number(outputPattern.exec(filename)![1]),
        path: `doc/decks/${filename}`,
        downloadUrl: `/api/deck-exports/${filename}`,
        createdAt: info.mtime.toISOString(),
        bytes: info.size,
      };
    }),
  );
  return outputs.filter((entry) => entry !== null).sort((a, b) => b.version - a.version);
}

/**
 * Publish a fully written temporary file with an atomic, exclusive hard link.
 * A competing save can never replace an existing version or expose half a PDF.
 */
export async function saveDeckFile(pdf: Buffer, directory = deckDirectory) {
  await mkdir(directory, { recursive: true });
  const temporary = path.join(directory, `.deck-${randomUUID()}.tmp`);
  await writeFile(temporary, pdf, { flag: "wx", mode: 0o600 });
  try {
    for (let attempt = 0; attempt < 100; attempt++) {
      const entries = await readdir(directory);
      const highest = entries.reduce((max, name) => {
        const match = outputPattern.exec(name);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0);
      const version = highest + 1;
      if (!Number.isSafeInteger(version)) throw new Error("PDF version limit exceeded.");
      const filename = `replit-example-deck-v${String(version).padStart(2, "0")}.pdf`;
      try {
        await link(temporary, path.join(directory, filename));
        return {
          filename,
          version,
          path: `doc/decks/${filename}`,
          downloadUrl: `/api/deck-exports/${filename}`,
          createdAt: (await stat(temporary)).mtime.toISOString(),
          bytes: pdf.length,
        };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
    }
    throw new Error("Too many simultaneous saves. Please try again.");
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}
