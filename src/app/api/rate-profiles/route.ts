import { NextResponse } from "next/server";
import { z } from "zod";
import { AreaCategory, SpecTier, SkuCategory } from "@prisma/client";
import { prisma } from "@/db/client";

const areaRateSchema = z.object({
  category: z.nativeEnum(AreaCategory),
  tier: z.nativeEnum(SpecTier).optional(),
  ratePerSqft: z.number().positive(),
  metadata: z.any().optional()
});

const skuSchema = z.object({
  category: z.nativeEnum(SkuCategory),
  tier: z.nativeEnum(SpecTier).optional(),
  unitPrice: z.number().positive(),
  metadata: z.any().optional()
});

const profileSchema = z.object({
  name: z.string().min(2),
  region: z.string().optional(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  areaRates: z.array(areaRateSchema).optional(),
  skuItems: z.array(skuSchema).optional()
});

export async function GET() {
  const profiles = await prisma.rateProfile.findMany({
    include: {
      areaRates: true,
      skuItems: true
    }
  });
  return NextResponse.json({ data: profiles });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const body = profileSchema.parse(payload);

  const profile = await prisma.rateProfile.create({
    data: {
      name: body.name,
      region: body.region,
      currency: body.currency ?? "AED",
      description: body.description,
      isDefault: body.isDefault ?? false,
      areaRates: body.areaRates
        ? { createMany: { data: body.areaRates } }
        : undefined,
      skuItems: body.skuItems
        ? { createMany: { data: body.skuItems } }
        : undefined
    },
    include: {
      areaRates: true,
      skuItems: true
    }
  });

  return NextResponse.json({ data: profile }, { status: 201 });
}
