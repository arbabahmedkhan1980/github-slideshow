import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";

const projectSchema = z.object({
  name: z.string().min(2),
  clientName: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  defaultHeightMm: z.number().int().min(2000).max(4000).optional(),
  rateProfileId: z.string().cuid().optional()
});

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      floors: true,
      bathroomTypes: true
    }
  });

  return NextResponse.json({ data: projects });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const body = projectSchema.parse(payload);

  const project = await prisma.project.create({
    data: {
      name: body.name,
      clientName: body.clientName,
      code: body.code,
      description: body.description,
      defaultHeightMm: body.defaultHeightMm ?? 2600,
      rateProfileId: body.rateProfileId
    }
  });

  return NextResponse.json({ data: project }, { status: 201 });
}
