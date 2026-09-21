import { AdminShell } from "@/components/admin/AdminShell";

type NoProfileStateProps = {
  active: "dashboard" | "cards" | "leads" | "profile";
  email: string;
};

/**
 * Um administrador só enxerga o perfil que possui. Sem vínculo não há o que
 * mostrar — e nunca caímos num perfil de outra pessoa.
 */
export function NoProfileState({ active, email }: NoProfileStateProps) {
  return (
    <AdminShell active={active} profileName={email}>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Sem perfil vinculado</p>
          <h1>Nenhum perfil por aqui ainda.</h1>
          <p>
            A conta <strong>{email}</strong> não é dona de nenhum perfil. Rode
            <code> npm run create-admin</code> com este mesmo e-mail para criar
            ou reivindicar um perfil.
          </p>
        </div>
      </header>
    </AdminShell>
  );
}
