import express, { Router, type IRouter } from "express";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import {
  SaveDeckExportBody,
  SaveDeckExportResponse,
  ListDeckExportsResponse,
  DownloadDeckExportParams,
} from "@workspace/api-zod";
import { deckDirectory, outputPattern, listDeckFiles, saveDeckFile } from "../lib/deck-files";

const router: IRouter = Router();
const saveTimes: number[] = [];

router.get("/deck-exports", async (_req, res): Promise<void> => {
  res.setHeader("Cache-Control", "no-store");
  res.json(ListDeckExportsResponse.parse(await listDeckFiles()));
});

router.post("/deck-exports", express.json({ limit: "44mb" }), async (req, res): Promise<void> => {
  if (req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ error: "Cross-site PDF saves are not allowed." });
    return;
  }
  const now = Date.now();
  while (saveTimes.length && saveTimes[0]! < now - 60_000) saveTimes.shift();
  if (saveTimes.length >= 20) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Please wait a minute before saving more PDFs." });
    return;
  }
  const parsed = SaveDeckExportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A base64-encoded PDF is required (maximum 30 MB)." });
    return;
  }
  const base64 = parsed.data.pdfBase64.replace(/^data:application\/pdf;base64,/, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    res.status(400).json({ error: "Invalid PDF encoding." });
    return;
  }
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > 30 * 1024 * 1024) {
    res.status(413).json({ error: "PDF must be smaller than 30 MB." });
    return;
  }
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    res.status(400).json({ error: "This file is not a PDF." });
    return;
  }
  try {
    const pdf = await PDFDocument.load(bytes);
    if (pdf.getPageCount() < 1 || pdf.getPageCount() > 100) {
      res.status(400).json({ error: "PDF must contain between 1 and 100 pages." });
      return;
    }
  } catch {
    res.status(400).json({ error: "The PDF could not be read. Please generate it again." });
    return;
  }
  saveTimes.push(now);
  const saved = await saveDeckFile(bytes);
  req.log.info({ filename: saved.filename, bytes: saved.bytes }, "Saved deck PDF");
  res.status(201).json(SaveDeckExportResponse.parse(saved));
});

router.get("/deck-exports/:filename", async (req, res): Promise<void> => {
  const parsed = DownloadDeckExportParams.safeParse(req.params);
  if (!parsed.success || !outputPattern.test(parsed.data.filename)) {
    res.status(400).json({ error: "Invalid deck filename." });
    return;
  }
  const filename = parsed.data.filename;
  res.download(path.join(deckDirectory, filename), filename, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: "Saved deck not found." });
  });
});

export default router;
