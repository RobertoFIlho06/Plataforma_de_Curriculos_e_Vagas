import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import FontesClient from "./FontesClient";

export const dynamic = "force-dynamic";

export default async function FontesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");
  const account = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, authEmail: true },
  });
  if (!account?.authEmail) redirect("/login");
  return <FontesClient />;
}
