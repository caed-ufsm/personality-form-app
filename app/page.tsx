import AboutProject from "@/components/aboutProject";

export const metadata = {
  title: 'Programa de Autoconhecimento Docente',
  description:
    'Página institucional com informações sobre a Coordenadoria de Ações Educacionais (CAEd/UFSM).',
};

export default function homePage() {
  return (
    <main id="conteudo">
        <AboutProject />
    </main>
  );
}
