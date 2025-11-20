import {
  AreaCategory,
  BathroomType,
  BathroomTypeSpec,
  RateProfile,
  SpecTier,
  SkuCategory
} from "@prisma/client";
import { prisma } from "@/db/client";
import { deriveGeometry } from "@/lib/geometry";
import {
  BathroomCostSummary,
  ComponentCostBreakdown,
  GlassPartitionConfig,
  LightingSelection,
  SecondFixSelection,
  VanitySelection,
  MirrorSelection,
  WallFinishOption
} from "@/lib/types";

type StructureConfig = {
  concreteTier?: SpecTier;
  lgsTier?: SpecTier;
  mepFirstFixTier?: SpecTier;
  mepSecondFixTier?: SpecTier;
  floorTileTier?: SpecTier;
};

type CostEngineContext = {
  bathroomType: BathroomType;
  spec?: BathroomTypeSpec | null;
  rateProfile: RateProfile & { areaRates: any[]; skuItems: any[] };
};

const DEFAULT_STRUCTURE: StructureConfig = {
  concreteTier: SpecTier.LOW,
  lgsTier: SpecTier.LOW,
  mepFirstFixTier: SpecTier.LOW,
  mepSecondFixTier: SpecTier.LOW,
  floorTileTier: SpecTier.LOW
};

const WALLS: Record<"NORTH" | "SOUTH" | "EAST" | "WEST", "length" | "width"> = {
  NORTH: "length",
  SOUTH: "length",
  EAST: "width",
  WEST: "width"
};

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    return value as T;
  } catch (error) {
    console.warn("Failed to parse spec json", error);
    return fallback;
  }
};

const findAreaRate = (
  profile: CostEngineContext["rateProfile"],
  category: AreaCategory,
  tier?: SpecTier | null
) => {
  return (
    profile.areaRates.find(
      (rate) => rate.category === category && rate.tier === tier
    ) ??
    profile.areaRates.find(
      (rate) => rate.category === category && rate.tier == null
    )
  );
};

const findSku = (
  profile: CostEngineContext["rateProfile"],
  category: SkuCategory,
  tier?: SpecTier | null
) => {
  return (
    profile.skuItems.find(
      (item) => item.category === category && item.tier === tier
    ) ??
    profile.skuItems.find(
      (item) => item.category === category && item.tier == null
    )
  );
};

const money = (value: number) => Math.round(value * 100) / 100;

export class CostEngine {
  constructor(private readonly db = prisma) {}

  async run(bathroomTypeId: string): Promise<BathroomCostSummary> {
    const bathroomType = await this.db.bathroomType.findUnique({
      where: { id: bathroomTypeId },
      include: {
        config: true,
        project: true
      }
    });

    if (!bathroomType) {
      throw new Error("Bathroom type not found");
    }

    const rateProfileId =
      bathroomType.config?.rateProfileId ?? bathroomType.project.rateProfileId;

    if (!rateProfileId) {
      throw new Error(
        "No rate profile configured. Assign a rate profile at project or type level."
      );
    }

    const rateProfile = await this.db.rateProfile.findUnique({
      where: { id: rateProfileId },
      include: { areaRates: true, skuItems: true }
    });

    if (!rateProfile) {
      throw new Error("Rate profile not found");
    }

    const context: CostEngineContext = {
      bathroomType,
      spec: bathroomType.config,
      rateProfile
    };

    const breakdown = this.calculateBreakdown(context);
    const subtotal = breakdown.reduce((sum, item) => sum + item.cost, 0);
    const overhead = bathroomType.config?.overheadMargin ?? 0.1;
    const total = money(subtotal * (1 + overhead));
    const costPerSqft = money(total / bathroomType.floorAreaSqft);

    return {
      bathroomTypeId: bathroomType.id,
      floorArea: bathroomType.floorAreaSqft,
      wallArea: bathroomType.wallAreaSqft,
      ceilingArea: bathroomType.ceilingAreaSqft,
      subtotal: money(subtotal),
      overheadMargin: overhead,
      total,
      costPerSqft,
      breakdown
    };
  }

  private calculateBreakdown(context: CostEngineContext): ComponentCostBreakdown[] {
    const { bathroomType, rateProfile } = context;
    const structure = parseJson<StructureConfig>(
      context.spec?.structureConfig,
      DEFAULT_STRUCTURE
    );
    const walls = parseJson<WallFinishOption[]>(
      context.spec?.wallFinishes,
      []
    );
    const secondFixSelections = parseJson<SecondFixSelection[]>(
      context.spec?.secondFixItems,
      []
    );
    const glassConfig = parseJson<GlassPartitionConfig>(
      context.spec?.glassConfig,
      { type: "NONE" }
    );
    const vanityConfig = parseJson<VanitySelection | null>(
      context.spec?.vanityConfig,
      null
    );
    const mirrorConfig = parseJson<MirrorSelection | null>(
      context.spec?.mirrorConfig,
      null
    );
    const lightingConfig = parseJson<LightingSelection>(
      context.spec?.lightingConfig,
      { ceilingLights: 1, ledStripFeet: 0 }
    );

    const geometry = deriveGeometry(
      bathroomType.lengthMm,
      bathroomType.widthMm,
      bathroomType.heightMm
    );

    const items: ComponentCostBreakdown[] = [];

    const addAreaCost = (
      label: string,
      category: AreaCategory,
      area: number,
      tier?: SpecTier
    ) => {
      const rate = findAreaRate(rateProfile, category, tier);
      if (!rate) return;
      const cost = money(area * rate.ratePerSqft);
      items.push({
        label,
        category,
        quantity: money(area),
        unit: "sqft",
        rate: rate.ratePerSqft,
        cost,
        metadata: { tier: tier ?? "STD" }
      });
    };

    const addSkuCost = (
      label: string,
      category: SkuCategory,
      quantity: number,
      tier?: SpecTier,
      metadata?: Record<string, unknown>
    ) => {
      const sku = findSku(rateProfile, category, tier);
      if (!sku) return;
      const cost = money(quantity * sku.unitPrice);
      items.push({
        label,
        category,
        quantity,
        unit: "qty",
        rate: sku.unitPrice,
        cost,
        metadata: { ...(metadata ?? {}), tier: tier ?? "STD" }
      });
    };

    addAreaCost("Concrete base", AreaCategory.CONCRETE_BASE, geometry.floorArea, structure.concreteTier);
    addAreaCost("LGS & board", AreaCategory.LGS_AND_BOARD, geometry.wallArea, structure.lgsTier);
    addAreaCost("MEP first fix", AreaCategory.MEP_FIRST_FIX, geometry.wallArea + geometry.ceilingArea, structure.mepFirstFixTier);
    addAreaCost("Floor tiles", AreaCategory.FLOOR_TILE, geometry.floorArea, structure.floorTileTier);

    walls.forEach((wall) => {
      if (wall.finishType === "NONE") {
        return;
      }
      const wallLength =
        WALLS[wall.wall] === "length" ? geometry.lengthFt : geometry.widthFt;
      const height = wall.finishHeightFt ?? geometry.heightFt;
      const area = wallLength * height;
      const category =
        wall.finishType === "PAINT"
          ? AreaCategory.PAINT
          : wall.finishType === "SOLID_SURFACE"
          ? AreaCategory.WALL_SOLID_SURFACE
          : AreaCategory.WALL_TILE;
      addAreaCost(`Wall ${wall.wall} - ${wall.finishType}`, category, area, wall.tier);
    });

    addAreaCost(
      "MEP second fix labour",
      AreaCategory.MEP_SECOND_FIX_LABOUR,
      geometry.floorArea,
      structure.mepSecondFixTier
    );

    secondFixSelections.forEach((item) => {
      addSkuCost(
        SkuCategory[item.category],
        item.category,
        item.quantity,
        item.tier
      );
    });

    if (glassConfig.type !== "NONE") {
      const width = glassConfig.widthFt ?? geometry.widthFt;
      const height = glassConfig.heightFt ?? geometry.heightFt;
      const factor = glassConfig.type === "HALF" ? 0.5 : 1;
      addAreaCost(
        `Glass partition (${glassConfig.type.toLowerCase()})`,
        AreaCategory.GLASS_PARTITION,
        width * height * factor,
        glassConfig.tier
      );
    }

    if (vanityConfig) {
      addSkuCost(
        `Vanity (${SkuCategory[vanityConfig.category]})`,
        vanityConfig.category,
        1,
        vanityConfig.tier
      );
    }

    if (mirrorConfig) {
      addSkuCost(
        `Mirror (${SkuCategory[mirrorConfig.category]})`,
        mirrorConfig.category,
        1,
        mirrorConfig.tier
      );
    }

    if (lightingConfig.ceilingLights > 0) {
      addSkuCost(
        "Ceiling lights",
        SkuCategory.CEILING_LIGHT,
        lightingConfig.ceilingLights,
        lightingConfig.tier
      );
    }

    if (lightingConfig.ledStripFeet > 0) {
      addAreaCost(
        "LED strip",
        AreaCategory.LED_STRIP,
        lightingConfig.ledStripFeet,
        lightingConfig.tier
      );
    }

    return items;
  }
}
