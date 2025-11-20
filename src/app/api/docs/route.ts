import { NextResponse } from "next/server";
import { openApiSpec } from "@/server/openapi";

export function GET() {
  return NextResponse.json(openApiSpec);
}
