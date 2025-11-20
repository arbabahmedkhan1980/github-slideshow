import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";

const manualBathroomSchema = z.object({
  bathrooms: z
    .array(
      z.object({
        floorId: z.string().cuid(),
        label: z.string().optional(),
        lengthMm: z.number().int().min(800),
        widthMm: z.number().int().min(800),
        heightMm: z.number().int().min(2000).max(4000)
      })
    )
    .min(1)
});

type Params = { params: { projectId: string } };

export async function GET(_: Request, { params }: Params) {
  const bathrooms = await prisma.bathroomInstance.findMany({
    where: { projectId: params.projectId },
    include: {
      floor: true,
      bathroomType: true
    }
  });

  return NextResponse.json({ data: bathrooms });
}

export async function POST(request: Request, { params }: Params) {
  const payload = await request.json();
  const body = manualBathroomSchema.parse(payload);

  const created = await prisma.$transaction(
    body.bathrooms.map((bathroom) =>
      prisma.bathroomInstance.create({
        data: {
          ...bathroom,
          label: bathroom.label ?? "Manual",
          projectId: params.projectId
        }
      })
    )
  );

  return NextResponse.json({ data: created }, { status: 201 });
}
