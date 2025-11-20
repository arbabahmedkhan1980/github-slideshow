import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/db/client";
import { formatCurrency } from "@/lib/utils";

type Params = { params: { projectId: string } };

export async function POST(_: Request, { params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      bathroomTypes: {
        include: {
          costSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1
          },
          config: true
        }
      }
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  const totalProjectCost = project.bathroomTypes.reduce((sum, type) => {
    const snapshot = type.costSnapshots[0];
    return sum + (snapshot?.totalCost ?? 0) * (type.instanceCount || 0);
  }, 0);

  doc
    .fontSize(24)
    .fillColor("#1E293B")
    .text("UniQube Pod Proposal", { align: "center" })
    .moveDown();

  doc
    .fontSize(12)
    .fillColor("#475569")
    .text(`Project: ${project.name}`)
    .text(`Client: ${project.clientName ?? "N/A"}`)
    .text(`Generated: ${new Date().toLocaleDateString()}`)
    .moveDown();

  doc
    .fontSize(14)
    .fillColor("#0f172a")
    .text("Bathroom Types", { underline: true })
    .moveDown(0.5);

  project.bathroomTypes.forEach((type) => {
    const snapshot = type.costSnapshots[0];
    doc
      .fontSize(12)
      .fillColor("#0f172a")
      .text(`${type.name} – ${type.lengthMm} x ${type.widthMm} x ${type.heightMm} mm`);
    doc
      .fontSize(11)
      .fillColor("#475569")
      .text(`Quantity: ${type.instanceCount}`)
      .text(
        `Cost per pod: ${snapshot ? formatCurrency(snapshot.costPerPod) : "TBD"}`
      )
      .text(
        `Total: ${
          snapshot
            ? formatCurrency(snapshot.costPerPod * (type.instanceCount || 0))
            : "TBD"
        }`
      )
      .moveDown();
  });

  doc
    .moveDown()
    .fontSize(14)
    .fillColor("#0f172a")
    .text("Commercial Summary", { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .fillColor("#475569")
    .text(`Total Project Cost: ${formatCurrency(totalProjectCost)}`)
    .text("Prices exclude VAT and logistics unless stated otherwise.")
    .text("Lead time: 6-8 weeks from final approvals.")
    .moveDown()
    .text("Scope includes factory-built modular bathroom pods per spec tiers.")
    .moveDown()
    .text("This document is confidential and intended for the recipient only.");

  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));
  const pdfBuffer = Buffer.concat(buffers);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.name}-proposal.pdf"`
    }
  });
}
