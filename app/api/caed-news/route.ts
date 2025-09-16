// app/api/caed-news/route.ts
import { NextResponse } from "next/server";
import { fetchCaedNews } from "@/lib/fetchCaedNews";

export const revalidate = 60 * 30; // 30 min

export async function GET() {
  try {
    const items = await fetchCaedNews(9);
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: [], error: "Falha ao carregar feed" }, { status: 500 });
  }
}
