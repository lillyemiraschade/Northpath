import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const account = await db.linkedInAccount.findUnique({
    where: { id: params.id },
  });

  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.linkedInAccount.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
