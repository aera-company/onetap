# One Tap

PWA mobile-first que transforma um cartão NFC ou QR Code em uma experiência de
apresentação, contato e geração de lead.

## Desenvolvimento

```bash
npm install
npm run dev
```

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

Use uma chave de servidor no formato `sb_secret_...`. Ela deve permanecer apenas
no backend e nas variáveis protegidas da Vercel. O código também aceita
`SUPABASE_SERVICE_ROLE_KEY` para projetos que ainda usam a chave JWT legada.

Sem essas variáveis, a interface continua funcionando e os eventos são aceitos,
mas não são persistidos.

## Painel administrativo

O painel fica em `/admin` e usa uma sessão assinada, armazenada em cookie
`httpOnly`. Configure no ambiente:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

O painel consulta as métricas diretamente do Supabase e permite atualizar os
campos do perfil público. As chaves do Supabase e as credenciais administrativas
permanecem somente no servidor.

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
