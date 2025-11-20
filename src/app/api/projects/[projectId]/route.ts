import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db/client";

const updateSchema = z.object({
  name: z.string().optional(),
  clientName: z.string().optional(),
  description: z.string().optional(),
  defaultHeightMm: z.number().int().min(2000).max(4000).optional(),
  rateProfileId: z.string().cuid().optional()
});

type Params = {
  params: { projectId: string };
};

export async function GET(_: Request, { params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      floors: {
        include: { bathroomInstances: true }
      },
      bathroomTypes: {
        include: {
          config: true,
          costSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ data: project });
}

export async function PUT(request: Request, { params }: Params) {
  const payload = await request.json();
  const body = updateSchema.parse(payload);

  const project = await prisma.project.update({
    where: { id: params.projectId },
    data: body
  });

  return NextResponse.json({ data: project });
}
