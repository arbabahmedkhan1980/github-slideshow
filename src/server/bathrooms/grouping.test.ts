import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { groupBathroomsBySize } from "./grouping";

const mockInstance = (overrides: Partial<any> = {}) => ({
  id: randomUUID(),
  label: "BATH",
  lengthMm: 2600,
  widthMm: 1800,
  heightMm: 2600,
  projectId: "proj",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

describe("groupBathroomsBySize", () => {
  it("clusters bathrooms by tolerance", () => {
    const bathrooms = [
      mockInstance({ lengthMm: 2600, widthMm: 1800 }),
      mockInstance({ lengthMm: 2580, widthMm: 1790 }),
      mockInstance({ lengthMm: 3100, widthMm: 2000 })
    ];

    const groups = groupBathroomsBySize(bathrooms as any, 50);
    expect(groups).toHaveLength(2);
    expect(groups[0].instances).toHaveLength(2);
    expect(groups[1].instances).toHaveLength(1);
  });

  it("recalculates centroid", () => {
    const bathrooms = [
      mockInstance({ lengthMm: 2500, widthMm: 1700 }),
      mockInstance({ lengthMm: 2550, widthMm: 1750 })
    ];

    const [group] = groupBathroomsBySize(bathrooms as any, 100);
    expect(group.centroid.lengthMm).toBeGreaterThan(2524);
    expect(group.centroid.widthMm).toBeGreaterThan(1724);
  });
});
