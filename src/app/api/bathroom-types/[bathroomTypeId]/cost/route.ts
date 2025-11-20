import { NextResponse } from "next/server";
import { CostEngine } from "@/server/cost/cost-engine";
import { prisma } from "@/db/client";

type Params = { params: { bathroomTypeId: string } };

export async function POST(_: Request, { params }: Params) {
  const engine = new CostEngine();
  const summary = await engine.run(params.bathroomTypeId);

  const type = await prisma.bathroomType.findUnique({
    where: { id: summary.bathroomTypeId },
    select: {
      config: { select: { rateProfileId: true } },
      project: { select: { rateProfileId: true } }
    }
  });

  await prisma.bathroomTypeCostSnapshot.create({
    data: {
      bathroomTypeId: summary.bathroomTypeId,
      rateProfileId: type?.config?.rateProfileId ?? type?.project?.rateProfileId,
      costPerPod: summary.total,
      costPerSqft: summary.costPerSqft,
      totalCost: summary.total,
      breakdown: summary.breakdown as any
    }
  });

  return NextResponse.json({ data: summary });
}
