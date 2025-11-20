import fs from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { BathroomDetectionResult } from "@/lib/types";
import { fromFeet } from "@/lib/geometry";

const BATHROOM_KEYWORDS = [
  /BATH/i,
  /BATHRM/i,
  /BATHROOM/i,
  /M\.?BATH/i,
  /WC/i,
  /POWDER/i
];

const DIMENSION_REGEX = /(\d{3,4})/g;

type DetectionConfig = {
  defaultHeightMm: number;
  floorId: string;
  projectId: string;
  sourceFileId?: string;
};

type PdfTextItem = TextItem & { transform: number[] };

const approxDistance = (a: PdfTextItem, b: PdfTextItem) => {
  const [ax, ay] = a.transform.slice(-2);
  const [bx, by] = b.transform.slice(-2);
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
};

const toBoundingBox = (item: PdfTextItem) => {
  const [x, y] = item.transform.slice(-2);
  const width = item.width ?? 0;
  const height = item.height ?? 0;
  return { x, y, width, height };
};

const closestDimensions = (
  labelItem: PdfTextItem,
  candidates: PdfTextItem[]
): number[] => {
  const sorted = [...candidates].sort(
    (a, b) => approxDistance(labelItem, a) - approxDistance(labelItem, b)
  );

  const dims: number[] = [];
  for (const item of sorted) {
    const matches = item.str.match(DIMENSION_REGEX);
    if (!matches) continue;
    for (const match of matches) {
      const value = Number(match);
      if (value >= 600 && value <= 6000) {
        dims.push(value);
      }
      if (dims.length === 2) {
        return dims;
      }
    }
  }
  return dims;
};

export class BathroomDetector {
  async detectFromPdf(
    filePath: string,
    config: DetectionConfig
  ): Promise<BathroomDetectionResult[]> {
    const pdfBuffer = await fs.readFile(filePath);
    const document = await getDocument({
      data: pdfBuffer,
      standardFontDataUrl: path.join(
        path.dirname(require.resolve("pdfjs-dist/package.json")),
        "standard_fonts"
      )
    }).promise;

    const detections: BathroomDetectionResult[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items as PdfTextItem[];
      const bathroomLabels = items.filter((item) =>
        BATHROOM_KEYWORDS.some((regex) => regex.test(item.str))
      );
      const numbers = items.filter((item) => DIMENSION_REGEX.test(item.str));

      for (const label of bathroomLabels) {
        const dims = closestDimensions(label, numbers);
        const [lengthMm = fromFeet(6), widthMm = fromFeet(5)] = dims;
        detections.push({
          label: label.str,
          lengthMm: Math.round(lengthMm),
          widthMm: Math.round(widthMm),
          heightMm: config.defaultHeightMm,
          floorId: config.floorId,
          projectId: config.projectId,
          sourceFileId: config.sourceFileId,
          pageNumber,
          bbox: toBoundingBox(label)
        });
      }
    }

    return detections;
  }
}
