import AppHeader from "@/app/components/AppHeader";
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
    </section>
  );
}
