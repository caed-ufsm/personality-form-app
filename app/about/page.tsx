import AboutCAED from '@/components/about';

export const metadata = {
  title: 'Sobre o CAEd — UFSM',
  description:
    'Página institucional com informações sobre a Coordenadoria de Ações Educacionais (CAEd/UFSM).',
};

export default function AboutPage() {
  return (
    <main id="conteudo">
        <AboutCAED />
    </main>
  );
}
