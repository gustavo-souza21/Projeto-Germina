# GERMINA — Especificações Técnicas

Documento complementar ao `README.md`, com o detalhamento técnico usado
para guiar a implementação do MVP: arquitetura, modelagem de dados,
design system e roadmap de gamificação.

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 |
| UI | Bootstrap 5 + design tokens próprios (CSS variables) |
| Backend / Dados | Supabase (Postgres + Auth + Storage) |
| Hospedagem | Vercel |
| Offline / instalável | PWA (`manifest.json` + service worker) |

## 2. Estrutura de pastas

```
germina-app/
├── app/                    # Rotas (App Router)
│   ├── layout.js           # Layout raiz (fontes, navbar, PWA meta)
│   ├── page.js             # Landing page
│   ├── login/page.js       # Autenticação (login/cadastro)
│   ├── jardim/page.js      # Dashboard de gamificação
│   └── herbario/page.js    # Biblioteca de plantas
├── components/              # Componentes reutilizáveis
│   ├── Navbar.js
│   ├── BarraXP.js
│   └── HerbarioGrid.js
├── data/
│   └── plantas.js           # Mock das 15 espécies (substituir por Supabase)
├── lib/
│   └── supabase.js          # Cliente Supabase (pronto, aguardando .env)
└── public/
    ├── manifest.json
    └── icons/
```

## 3. Modelagem de dados (Supabase / Postgres)

Tabelas mínimas para sair do mock e ir para dados reais:

```sql
-- Espécies do Horto
create table plantas (
  id text primary key,
  nome text not null,
  nome_cientifico text not null,
  descricao text,
  usos text[],
  raridade text check (raridade in ('comum', 'rara')),
  renisus boolean default false,
  xp int default 25
);

-- Perfil de gamificação do usuário (1:1 com auth.users)
create table perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  nivel int default 1,
  xp_atual int default 0,
  sementes int default 0,
  adubo int default 0,
  moedas int default 0
);

-- Registro de plantas estudadas por usuário (herbário pessoal)
create table herbario_usuario (
  user_id uuid references auth.users(id) on delete cascade,
  planta_id text references plantas(id),
  estudado_em timestamp default now(),
  primary key (user_id, planta_id)
);

-- Desafios diários e progresso
create table desafios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  recompensa_xp int not null,
  tipo text check (tipo in ('diario', 'semanal', 'especial'))
);

create table desafios_usuario (
  user_id uuid references auth.users(id) on delete cascade,
  desafio_id uuid references desafios(id),
  concluido boolean default false,
  concluido_em timestamp,
  primary key (user_id, desafio_id)
);
```

> Row Level Security (RLS) deve ser habilitada em todas as tabelas de
> usuário, restringindo leitura/escrita ao próprio `auth.uid()`.

## 4. Sistema de gamificação

### Níveis (Jornada do Conhecimento)

| Nível | Nome | XP mínimo |
|---|---|---|
| 1 | 🌱 Semente | 0 |
| 2 | 🌱 Broto | 100 |
| 3 | 🌱 Muda | 250 |
| 4 | 🌳 Flores | 500 |
| 5 | 🌳 Árvore | 900 |
| 6 | 🌳 Frutos | 1500 |

### Recursos

- **XP**: ganho ao estudar plantas e completar desafios.
- **Sementes**: desbloqueadas ao subir de nível; usadas para "plantar" novas plantas a estudar.
- **Adubo**: obtido em desafios; combinado com sementes libera conteúdo avançado.
- **Moedas**: usadas na loja de recompensas (temas visuais, dicas premium).

### Regra de negócio central

```
ao_estudar_planta(usuario, planta):
    adicionar_xp(usuario, planta.xp)
    registrar_em_herbario(usuario, planta)
    se planta.raridade == "rara":
        adicionar_moedas(usuario, bonus_renisus)
    verificar_subida_de_nivel(usuario)
```

## 5. Design tokens

Extraídos da identidade visual (logo folha + circuito, referências
visuais do projeto): verde para natureza/crescimento, azul para a camada
tecnológica ("circuito" que sustenta a raiz), âmbar reservado
exclusivamente para XP e conquistas.

```css
--germina-green-900: #0f3d2e;   /* títulos, fundo de destaque */
--germina-green-700: #1b5e3f;   /* botões primários */
--germina-green-500: #2d8659;   /* acentos, ícones */
--germina-blue-700:  #1c3d5a;   /* camada "tecnologia" */
--germina-amber-600: #b8860b;   /* XP, selos, conquistas — uso exclusivo */
--font-display: "Fraunces";     /* títulos */
--font-body: "Inter";           /* texto corrido */
```

Ver `app/globals.css` para a implementação completa.

## 6. Roadmap sugerido (próximos passos)

1. Conectar Supabase real (Auth + tabelas acima) e remover mocks de `data/plantas.js`.
2. Implementar upload de foto para o "Diagnóstico Inteligente" (Supabase Storage + API de visão computacional).
3. Tela de Comunidade (feed de discussões por planta).
4. Sistema de temas desbloqueáveis por nível (dark mode / paletas alternativas).
5. Testes automatizados (Jest + Testing Library) nos componentes de gamificação.
6. Configurar CI/CD no GitHub Actions para deploy automático na Vercel.
