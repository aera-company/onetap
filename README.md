# One Tap

PWA mobile-first que transforma um cartão NFC ou QR Code em uma experiência de
apresentação, contato e geração de lead.

## Desenvolvimento

```bash
npm install
npm run dev
```

### Verificação

```bash
npm run check
```

Roda `typecheck`, `lint` e os testes. O `npm run smoke` é separado porque
depende de um build: ele sobe o `next start` e confere as rotas principais,
inclusive que o painel fica barrado sem sessão e que a CSP de produção não
libera `unsafe-eval`.

Vale rodar o smoke antes de publicar. Um erro real desta base — a página do
perfil devolvendo 500 — passou por typecheck, lint, testes e build, e só
aparecia com `next start`.

O CI (`.github/workflows/ci.yml`) roda os cinco: typecheck, lint, testes, build
e smoke.

Abra `http://localhost:3000/t/tiago`.

Para simular um cartão:

```txt
http://localhost:3000/t/tiago?card=aera-tiago-001
```

Para validar o estado desativado:

```txt
http://localhost:3000/t/tiago?card=aera-tiago-disabled
```

## Conteúdo do piloto

Os dados provisórios ficam em `src/data/profiles.ts`. Preencha telefone,
WhatsApp, e-mail, site, Instagram, LinkedIn, apresentação e agendamento antes da
publicação.

## Supabase

1. Execute `supabase/schema.sql` no SQL Editor do projeto.
2. Copie `.env.example` para `.env.local`.
3. Preencha `SUPABASE_URL` e `SUPABASE_SECRET_KEY`.

> **Atualizando um banco existente:** reexecute `supabase/schema.sql`. Ele é
> idempotente e traz as tabelas `admin_users` e `leads`, as colunas
> `profiles.owner_id`, `profiles.services` e `profiles.leads_enabled`, amplia o
> check de `events.event_type` com `lead_submit`, torna `events.session_id`
> nulo (eventos gravados pelo servidor não têm sessão de browser), cria a
> tabela `rate_limits` e a função `onetap_rate_limit`, remove a coluna
> `events.ip_hash_source` (só continha uma string constante), cria índices
> novos e as funções de agregação `onetap_dashboard_stats` e
> `onetap_card_stats`. **O painel não
> carrega sem essas funções.** Depois rode `npm run create-admin` para criar o
> administrador e vincular o perfil — sem isso ninguém entra no painel. Para
> repor os serviços do perfil piloto, rode também `supabase/seed.sql`.

As métricas são contadas no Postgres, sobre a tabela inteira. Antes o painel
baixava os últimos 2.000 eventos e somava em JavaScript, o que fazia "total de
acessos desde o início" virar "total dos últimos 2.000 eventos".

Quando o Supabase está configurado mas indisponível, o perfil público falha
fechado (mostra indisponibilidade) em vez de cair nos dados locais de
`src/data/profiles.ts` — que são semente de desenvolvimento e podem estar
desatualizados, inclusive quanto a um perfil já desativado. Os dados locais só
são usados quando `SUPABASE_URL`/chave não estão definidos.

Use uma chave de servidor no formato `sb_secret_...`. Ela deve permanecer apenas
no backend e nas variáveis protegidas da Vercel. O código também aceita
`SUPABASE_SERVICE_ROLE_KEY` para projetos que ainda usam a chave JWT legada.

Sem essas variáveis, a interface continua funcionando e os eventos são aceitos,
mas não são persistidos.

## Painel administrativo

O painel fica em `/admin` e usa uma sessão assinada, armazenada em cookie
`httpOnly`. No ambiente basta o segredo que assina a sessão:

```env
ADMIN_SESSION_SECRET=
```

Os administradores ficam na tabela `admin_users`, com a senha guardada como
hash scrypt — não há mais login por variável de ambiente. Cadastre o primeiro
acesso com:

```bash
npm run create-admin
```

O script pergunta e-mail, senha (digitada de forma oculta) e o slug do perfil.
Se o perfil já existir, ele é vinculado à conta; se não existir, é criado. Rodar
de novo com um e-mail já cadastrado troca a senha, o que serve como reset.

Cada administrador enxerga e edita **apenas o perfil que possui**
(`profiles.owner_id`). Métricas, cartões, QR Codes e edição de perfil são
escopados por essa posse no servidor — o `profileId` que vem do formulário só é
aceito se bater com o perfil do dono logado.

O painel consulta as métricas diretamente do Supabase e permite atualizar os
campos do perfil público, incluindo até 4 blocos de competências. As chaves do
Supabase e as credenciais administrativas permanecem somente no servidor.

A URL do símbolo/foto aceita um caminho interno (`/brand/aera-symbol.png`) ou
uma URL http(s); os demais links aceitam apenas http(s). Sem o símbolo, o perfil
mostra as iniciais.

### Captura de contato

O perfil público traz uma seção **Troca de contato**: o visitante deixa nome e
e-mail ou telefone (ao menos um dos dois), com mensagem opcional. Os contatos
aparecem em `/admin/leads`, escopados pelo dono do perfil.

O formulário funciona sem JavaScript — é um `form` comum que faz POST e volta
para o perfil com o estado do envio. Ligue ou desligue em **Perfil público →
Receber contatos**; desligado, a seção some e o endpoint recusa envios.

Proteções específicas de `/api/leads`:

- campo-armadilha invisível (respondemos sucesso ao bot, sem gravar);
- teto de 30 contatos por perfil por hora;
- o mesmo e-mail no mesmo perfil não duplica dentro de 24 h;
- perfil inativo, sem captura ligada ou cartão pausado não geram lead.

Cada envio também registra um evento `lead_submit`, então a taxa de contatos
aparece junto das demais métricas no painel.

## Proteção das rotas públicas

`/api/events` e `/api/leads` são as duas rotas de escrita abertas. Ambas exigem
que o `Origin`, quando enviado, seja o mesmo host, e passam por um limite por
IP: 60 eventos por minuto e 5 contatos a cada 10 minutos.

O contador vive no Postgres (`rate_limits` + `onetap_rate_limit`), incrementado
e avaliado numa única ida ao banco. Contador em memória não serviria: em
serverless cada instância teria o seu, e o limite real seria multiplicado pelo
número de instâncias.

O endereço IP **não é gravado**. A chave é um HMAC do IP com o nome da rota,
salgado por `IP_HASH_SALT` (na falta dele, `ADMIN_SESSION_SECRET`). As linhas
são efêmeras e a própria função varre janelas com mais de uma hora. Sem nenhum
segredo configurado o limite é ignorado, com aviso no log — parar o tráfego
legítimo por configuração incompleta seria pior.

`/api/events` também deixou de aceitar o `profileId` do cliente: agora recebe o
`slug` e resolve o perfil no servidor, com leitura cacheada. Um `cardCode` de
outro perfil, ou de cartão pausado, não credita origem — o evento entra como
acesso direto. E `lead_submit` não é aceito por essa rota: é gravado pelo
servidor quando um contato entra, senão daria para inflar a métrica sem deixar
lead nenhum.

O login (`/api/admin/login`) usa o mesmo limitador: 20 tentativas a cada 15
minutos por IP, avaliadas **antes** da verificação da senha — o scrypt custa
~100 ms de CPU por tentativa e é ele próprio o alvo do abuso. O login também
exige mesma origem, para que um site externo não consiga logar a vítima numa
conta escolhida por ele.

### Middleware e headers

`src/middleware.ts` barra `/admin/*` e `/api/admin/*` sem sessão válida, antes
de a rota executar. Cada página já confere a sessão por conta própria; o
middleware existe para que uma rota nova não fique aberta por esquecimento. Ele
só valida assinatura e prazo do cookie, sem ir ao banco — decidir *qual perfil*
o usuário administra continua nas rotas.

Por rodar no Edge, a sessão usa Web Crypto em vez de `node:crypto`. É uma
implementação só para os dois runtimes, e `crypto.subtle.verify` já compara em
tempo constante.

O `next.config.ts` aplica CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy` e `Permissions-Policy` em todas as rotas. A CSP libera
`unsafe-eval` **apenas em desenvolvimento**, porque o webpack embrulha os
módulos em `eval()` para o HMR; sem isso o `npm run dev` não hidrata.

O limite do login é só por IP, de propósito. Limitar por e-mail deteria um
ataque distribuído, mas criaria uma negação de serviço por conta: qualquer um
poderia travar o acesso de um administrador só disparando tentativas contra o
e-mail dele.

### Cartões NFC e QR Code

Em `/admin/cards` é possível:

- criar cartões com código permanente;
- identificar campanha e local;
- ativar ou pausar um cartão;
- copiar a URL exata para gravação em uma tag NFC;
- gerar e baixar o QR Code em SVG;
- acompanhar acessos e ações por cartão.

O QR Code é gerado no servidor e não depende de serviços externos.

## PWA One Tap

O painel pode ser instalado na tela inicial como o app **One Tap**. O PWA inclui:

- ícones próprios para iOS e Android;
- abertura direta em `/admin/dashboard`;
- atalhos para métricas, cartões e perfil;
- service worker para ativos estáticos;
- página segura de indisponibilidade quando estiver sem conexão;
- instruções de instalação no iPhone e prompt nativo em navegadores compatíveis.

As páginas administrativas e as respostas da API não são armazenadas no cache
offline.
