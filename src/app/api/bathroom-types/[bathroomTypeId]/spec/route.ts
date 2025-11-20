import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";

const specSchema = z.object({
  rateProfileId: z.string().cuid().optional(),
  structureConfig: z.any().optional(),
  wallFinishes: z.any().optional(),
  secondFixItems: z.any().optional(),
  glassConfig: z.any().optional(),
  vanityConfig: z.any().optional(),
  lightingConfig: z.any().optional(),
  mirrorConfig: z.any().optional(),
  overrides: z.any().optional(),
  overheadMargin: z.number().min(0).max(0.5).optional(),
  notes: z.string().optional()
});

type Params = { params: { bathroomTypeId: string } };

export async function GET(_: Request, { params }: Params) {
  const spec = await prisma.bathroomTypeSpec.findUnique({
    where: { bathroomTypeId: params.bathroomTypeId }
  });

  return NextResponse.json({ data: spec });
}

export async function PUT(request: Request, { params }: Params) {
  const payload = await request.json();
  const body = specSchema.parse(payload);

  const spec = await prisma.bathroomTypeSpec.upsert({
    where: { bathroomTypeId: params.bathroomTypeId },
    create: {
      bathroomTypeId: params.bathroomTypeId,
      ...body
    },
    update: {
      ...body
    }
  });

  return NextResponse.json({ data: spec });
}
