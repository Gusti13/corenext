// app/api/users/[id]/password/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"; // pastikan bcryptjs diinstall

type ContextType = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: ContextType) {
  const { id } = await context.params;
  const body = await req.json();
  const hashedPassword = await bcrypt.hash(body.password, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
