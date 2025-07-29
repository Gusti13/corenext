import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, username: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { username, password, name } = body;

  const data: any = {};
  if (username) data.username = username;
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 10);

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.user.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Deleted" });
}
