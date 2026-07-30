export default function ProfileNotFound() {
  return (
    <main className="state-page">
      <div className="state-page__mark">ONE TAP</div>
      <div>
        <p className="eyebrow">Perfil indisponível</p>
        <h1>Este perfil não está disponível.</h1>
        <p>Verifique o endereço ou solicite um novo acesso ao responsável.</p>
      </div>
      <a href="/">Conhecer o One Tap <span aria-hidden="true">↗</span></a>
    </main>
  );
}
