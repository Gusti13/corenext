import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const column = searchParams.get("column") || "name";
  const sort = searchParams.get("sort") === "desc" ? "desc" : "asc";
  const search = searchParams.get("search")?.toLowerCase() || "";

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [column]: sort },
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password, name } = body;

  if (!username || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashed, name },
  });

  return NextResponse.json(user, { status: 201 });
}
