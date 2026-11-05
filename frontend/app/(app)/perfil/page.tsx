import AppHeader from "@/app/components/AppHeader";
import BotaoSair from "@/app/components/BotaoSair";
import PerfilUsuario from "@/app/components/PerfilUsuario";

export default function PerfilPage() {
  return (
    <section aria-labelledby="perfil-title">
      <AppHeader
        id="perfil-title"
        titulo="Seu perfil"
        descricao="Confira e atualize seus dados da conta."
      />
      <PerfilUsuario />
      <BotaoSair />
    </section>
  );
}
