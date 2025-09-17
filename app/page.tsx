// app/page.tsx
import Hero from '@/components/home/hero';
import NewsEventsSection, { NewsItem } from '@/components/home/newseventssection';

function toAbsoluteUFSM(url?: string): string {
  if (!url) return "#";
  try {
    // resolve relativos tipo "/pro-reitorias/..." contra o domínio da UFSM
    return new URL(url, "https://www.ufsm.br").toString();
  } catch {
    return "#";
  }
}

async function getNews(): Promise<NewsItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/caed-news`, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) return [];

  const { items } = await res.json();

  // Normaliza: garante `href` e absoluto
  const normalized: NewsItem[] = (items ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    date: n.date,
    summary: n.summary,
    href: toAbsoluteUFSM(n.href ?? n.link), // usa href se existir; senão link
  }));

  // esse console.log sai no terminal (server)
  // console.log("[CAED News sample]", normalized[0]);

  return normalized;
}

export default async function HomePage() {
  const news = await getNews();

  return (
    <main>
      <Hero
        title="CAEd — Centro de Avaliação Educacional"
        subtitle="Projetos, pesquisas e tecnologia a serviço da educação na UFSM."
        ctas={[{ label: 'Conheça nossos projetos', href: '#projetos' }]}
      />

      <NewsEventsSection title="Últimas Notícias" items={news} />

    </main>
  );
}
