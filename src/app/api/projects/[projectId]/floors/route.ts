import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";

const floorSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().optional(),
  defaultHeightMm: z.number().int().optional()
});

type Params = {
  params: { projectId: string };
};

export async function GET(_: Request, { params }: Params) {
  const floors = await prisma.floor.findMany({
    where: { projectId: params.projectId },
    orderBy: { level: "asc" },
    include: {
      bathroomInstances: true
    }
  });
  return NextResponse.json({ data: floors });
}

export async function POST(request: Request, { params }: Params) {
  const payload = await request.json();
  const body = floorSchema.parse(payload);

  const floor = await prisma.floor.create({
    data: {
      projectId: params.projectId,
      name: body.name,
      level: body.level,
      defaultHeightMm: body.defaultHeightMm
    }
  });

  return NextResponse.json({ data: floor }, { status: 201 });
}
