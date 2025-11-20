import { describe, expect, it } from "vitest";
import { AreaCategory, SpecTier, SkuCategory } from "@prisma/client";
import { CostEngine } from "./cost-engine";

const mockBathroomType = {
  id: "type_1",
  name: "Type A",
  lengthMm: 2400,
  widthMm: 1600,
  heightMm: 2600,
  toleranceMm: 50,
  instanceCount: 4,
  floorAreaSqft: 41.34,
  wallAreaSqft: 179.75,
  ceilingAreaSqft: 41.34,
  projectId: "project_1",
  createdAt: new Date(),
  updatedAt: new Date(),
  config: {
    bathroomTypeId: "type_1",
    rateProfileId: "rate_profile_1",
    overheadMargin: 0.1,
    structureConfig: {
      concreteTier: SpecTier.LOW,
      lgsTier: SpecTier.LOW,
      mepFirstFixTier: SpecTier.LOW,
      mepSecondFixTier: SpecTier.LOW,
      floorTileTier: SpecTier.LOW
    },
    wallFinishes: [],
    secondFixItems: [
      { category: SkuCategory.WC, tier: SpecTier.LOW, quantity: 1 }
    ],
    lightingConfig: { ceilingLights: 2, ledStripFeet: 4, tier: SpecTier.LOW },
    vanityConfig: null,
    glassConfig: { type: "NONE" },
    mirrorConfig: null
  },
  project: {
    id: "project_1",
    name: "Test",
    rateProfileId: "rate_profile_1",
    defaultHeightMm: 2600
  }
} as any;

const mockRateProfile = {
  id: "rate_profile_1",
  name: "Default",
  areaRates: [
    {
      id: "ar1",
      category: AreaCategory.CONCRETE_BASE,
      tier: SpecTier.LOW,
      ratePerSqft: 12
    },
    {
      id: "ar2",
      category: AreaCategory.LGS_AND_BOARD,
      tier: SpecTier.LOW,
      ratePerSqft: 18
    },
    {
      id: "ar3",
      category: AreaCategory.MEP_FIRST_FIX,
      tier: SpecTier.LOW,
      ratePerSqft: 10
    },
    {
      id: "ar4",
      category: AreaCategory.FLOOR_TILE,
      tier: SpecTier.LOW,
      ratePerSqft: 25
    },
    {
      id: "ar5",
      category: AreaCategory.MEP_SECOND_FIX_LABOUR,
      tier: SpecTier.LOW,
      ratePerSqft: 8
    },
    {
      id: "ar6",
      category: AreaCategory.LED_STRIP,
      tier: SpecTier.LOW,
      ratePerSqft: 5
    }
  ],
  skuItems: [
    { id: "sku1", category: SkuCategory.CEILING_LIGHT, tier: SpecTier.LOW, unitPrice: 45 },
    { id: "sku2", category: SkuCategory.WC, tier: SpecTier.LOW, unitPrice: 650 },
    { id: "sku3", category: SkuCategory.SHOWER_SET, tier: SpecTier.LOW, unitPrice: 480 },
    { id: "sku4", category: SkuCategory.BASIN, tier: SpecTier.LOW, unitPrice: 520 },
    { id: "sku5", category: SkuCategory.BASIN_MIXER, tier: SpecTier.LOW, unitPrice: 320 }
  ]
} as any;

describe("CostEngine", () => {
  it("produces a breakdown with totals", async () => {
    const fakeDb = {
      bathroomType: {
        findUnique: () => Promise.resolve(mockBathroomType)
      },
      rateProfile: {
        findUnique: () => Promise.resolve(mockRateProfile)
      }
    } as any;

    const engine = new CostEngine(fakeDb);
    const summary = await engine.run("type_1");

    expect(summary.total).toBeGreaterThan(0);
    expect(summary.breakdown.find((row) => row.label === "Concrete base")).toBeTruthy();
    expect(summary.breakdown.find((row) => row.category === SkuCategory.WC)).toBeTruthy();
  });
});
