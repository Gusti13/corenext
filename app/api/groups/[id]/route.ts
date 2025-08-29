import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

type ContextType = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: ContextType) {
  const { id } = await context.params;
  const user = await prisma.group.findUnique({
    where: { id: id },
    select: { name: true, created_at: true, updated_at: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request, context: ContextType) {
  const { id } = await context.params;
  const body = await req.json();
  const { username, password, name } = body;

  const data: any = {};
  if (username) data.username = username;
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: ContextType) {
  const { id } = await context.params;
  await prisma.user.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: "Deleted" });
}
