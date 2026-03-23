import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);

  const user = await db.user.create({
    data: { name, email, password: hashedPassword },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
