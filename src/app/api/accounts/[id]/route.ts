import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await db.linkedInAccount.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.linkedInAccount.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
