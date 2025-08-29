import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const [data, total] = await Promise.all([
    prisma.group.findMany({
      where,
      orderBy: { [column]: sort },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.group.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const data = await prisma.group.create({
    data: { name },
  });

  return NextResponse.json(data, { status: 201 });
}
