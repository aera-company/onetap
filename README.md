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
3. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

Sem essas variáveis, a interface continua funcionando e os eventos são aceitos,
mas não são persistidos.
