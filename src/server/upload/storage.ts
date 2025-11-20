import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

export const saveUpload = async (
  file: File,
  options?: { prefix?: string }
): Promise<{ filepath: string; originalName: string }> => {
  await ensureUploadDir();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const id = randomUUID();
  const filename = `${options?.prefix ?? "upload"}-${id}-${file.name.replace(/\s+/g, "-")}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  return { filepath, originalName: file.name };
};
