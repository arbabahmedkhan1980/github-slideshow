import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";
import { groupBathroomsBySize } from "@/server/bathrooms/grouping";
import { deriveGeometry } from "@/lib/geometry";

const paramsSchema = z.object({
  toleranceMm: z.number().int().min(10).max(200).default(50)
});

const withinTolerance = (a: number, b: number, tolerance: number) =>
  Math.abs(a - b) <= tolerance;

type Params = { params: { projectId: string } };

export async function POST(request: Request, { params }: Params) {
  const payload = await request.json().catch(() => ({}));
  const body = paramsSchema.parse(payload);

  const bathrooms = await prisma.bathroomInstance.findMany({
    where: { projectId: params.projectId }
  });

  if (!bathrooms.length) {
    return NextResponse.json(
      { error: "No bathrooms to group" },
      { status: 400 }
    );
  }

  const groups = groupBathroomsBySize(bathrooms, body.toleranceMm);
  const existingTypes = await prisma.bathroomType.findMany({
    where: { projectId: params.projectId }
  });

  const updates = [];

  for (const group of groups) {
    const geometry = deriveGeometry(
      group.centroid.lengthMm,
      group.centroid.widthMm,
      group.centroid.heightMm
    );

    let type = existingTypes.find(
      (candidate) =>
        withinTolerance(
          candidate.lengthMm,
          group.centroid.lengthMm,
          candidate.toleranceMm
        ) &&
        withinTolerance(
          candidate.widthMm,
          group.centroid.widthMm,
          candidate.toleranceMm
        )
    );

    if (type) {
      type = await prisma.bathroomType.update({
        where: { id: type.id },
        data: {
          lengthMm: Math.round(group.centroid.lengthMm),
          widthMm: Math.round(group.centroid.widthMm),
          heightMm: Math.round(group.centroid.heightMm),
          instanceCount: group.instances.length,
          floorAreaSqft: geometry.floorArea,
          wallAreaSqft: geometry.wallArea,
          ceilingAreaSqft: geometry.ceilingArea
        }
      });
    } else {
      type = await prisma.bathroomType.create({
        data: {
          projectId: params.projectId,
          name: `Type ${existingTypes.length + updates.length + 1}`,
          lengthMm: Math.round(group.centroid.lengthMm),
          widthMm: Math.round(group.centroid.widthMm),
          heightMm: Math.round(group.centroid.heightMm),
          toleranceMm: body.toleranceMm,
          instanceCount: group.instances.length,
          floorAreaSqft: geometry.floorArea,
          wallAreaSqft: geometry.wallArea,
          ceilingAreaSqft: geometry.ceilingArea
        }
      });
    }

    updates.push(type);

    await prisma.bathroomInstance.updateMany({
      where: {
        id: {
          in: group.instances.map((instance) => instance.id)
        }
      },
      data: { bathroomTypeId: type.id }
    });
  }

  return NextResponse.json({ data: updates });
}
