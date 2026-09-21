import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="state-page">
      <div className="state-page__mark" aria-label="AERA One Tap"><span className="aera-mark" aria-hidden="true" /><span className="wordmark__product">One Tap</span></div>
      <div>
        <p className="eyebrow">Perfil indisponível</p>
        <h1>Este perfil não está disponível.</h1>
        <p>Verifique o endereço ou solicite um novo acesso ao responsável.</p>
      </div>
      <Link href="/">
        Conhecer o One Tap <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}
