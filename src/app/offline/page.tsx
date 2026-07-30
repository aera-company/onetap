import Image from "next/image";

export default function OfflinePage() {
  return (
    <main className="state-page">
      <div className="state-page__mark">ONE TAP</div>
      <div>
        <div className="avatar avatar--brand">
          <Image
            src="/brand/aera-symbol.png"
            alt=""
            width={44}
            height={44}
            priority
          />
        </div>
        <p className="eyebrow">Sem conexão</p>
        <h1>O sinal volta em instantes.</h1>
        <p>
          Conecte-se à internet e tente novamente para acessar seus cartões,
          métricas e perfil.
        </p>
      </div>
      <a href="/admin/dashboard">
        Tentar novamente <span aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
