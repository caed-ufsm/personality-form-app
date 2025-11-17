import AboutProject from "@/components/aboutProject";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: 'Sobre o CAEd — UFSM',
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
