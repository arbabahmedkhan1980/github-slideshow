import {
  AreaCategory,
  SpecTier,
  SkuCategory
} from "@prisma/client";

export type DimensionMm = {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
};

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BathroomDetectionResult = DimensionMm & {
  label?: string;
  floorId: string;
  projectId: string;
  sourceFileId?: string;
  pageNumber?: number;
  bbox?: BoundingBox;
};

export type BathroomGrouping = {
  bathroomTypeId: string;
  bathroomInstanceIds: string[];
};

export type WallFinishOption = {
  wall: "NORTH" | "SOUTH" | "EAST" | "WEST";
  finishType: "TILE" | "SOLID_SURFACE" | "PAINT" | "NONE";
  finishHeightFt: number;
  tier?: SpecTier;
};

export type SecondFixSelection = {
  category: SkuCategory;
  tier?: SpecTier;
  quantity: number;
};

export type LightingSelection = {
  tier?: SpecTier;
  ceilingLights: number;
  ledStripFeet: number;
};

export type VanitySelection = {
  category:
    | SkuCategory.VANITY_600_SINGLE
    | SkuCategory.VANITY_900_SINGLE
    | SkuCategory.VANITY_1200_DOUBLE;
  tier?: SpecTier;
};

export type MirrorSelection = {
  category:
    | SkuCategory.MIRROR_SMALL
    | SkuCategory.MIRROR_MEDIUM
    | SkuCategory.MIRROR_FULL;
  tier?: SpecTier;
};

export type GlassPartitionConfig = {
  type: "NONE" | "HALF" | "FULL";
  widthFt?: number;
  heightFt?: number;
  tier?: SpecTier;
};

export type ComponentCostBreakdown = {
  label: string;
  category: AreaCategory | SkuCategory | "SUMMARY";
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
  metadata?: Record<string, unknown>;
};

export type BathroomCostSummary = {
  bathroomTypeId: string;
  floorArea: number;
  wallArea: number;
  ceilingArea: number;
  subtotal: number;
  overheadMargin: number;
  total: number;
  costPerSqft: number;
  breakdown: ComponentCostBreakdown[];
};
