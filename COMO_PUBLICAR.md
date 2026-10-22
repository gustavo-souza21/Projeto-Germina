# Como publicar este repositório no GitHub

O histórico já está montado — duas branches, 5 commits. Falta só apontar
para o seu GitHub e empurrar.

## 1. Criar o repositório no GitHub

Em https://github.com/new, com a conta `gustavo-souza21`:

- **Nome**: `germina` (ou o que preferir)
- **Visibilidade**: sua escolha — ver a nota sobre isso no fim
- ⚠️ **NÃO marque** "Add a README", "Add .gitignore" nem "Choose a license".
  Qualquer um dos três cria um commit inicial no GitHub que vai conflitar
  com o histórico que já está aqui. O repositório precisa nascer vazio.

## 2. Conectar e publicar

Do diretório onde você descompactou este projeto:

```bash
git remote add origin https://github.com/gustavo-souza21/germina.git

# A main é o que está em produção hoje (até a Fase 4)
git push -u origin main

# A Sarah vai separada, porque ainda não foi para produção
git push -u origin feat/guia-sarah
```

Se o `git push` pedir senha: o GitHub não aceita mais senha de conta desde
2021. Use um Personal Access Token (Settings → Developer settings → Personal
access tokens → Tokens (classic), com o escopo `repo`) no lugar da senha, ou
configure SSH.

## 3. Conferir que deu certo

```bash
git log --oneline --graph --all
git branch -r
```

Devem aparecer 4 commits na `main` e 1 a mais na `feat/guia-sarah`.

---

## O que foi feito antes de commitar

- **Varredura de segredos** em todos os commits das duas branches: nenhuma
  chave do Supabase, nenhum token, nada. A única menção a
  `SUPABASE_SERVICE_ROLE_KEY` no código é a leitura legítima da variável de
  ambiente em `lib/supabase/admin.ts`.
- **`node_modules`, `.next` e `.tsbuildinfo`** não entraram em commit nenhum.
- **Correção no `.gitignore`**: o padrão `.env*` estava excluindo também o
  `.env.example` — justamente o arquivo que *deve* ir para o repositório,
  porque documenta quais variáveis configurar e não tem valor preenchido.
  Foi adicionada a exceção `!.env.example`.

## Sobre o histórico

Os 4 commits da `main` são **reconstruídos** a partir dos pacotes de cada
entrega, não commits feitos em tempo real durante o desenvolvimento. As datas
correspondem às datas reais de cada entrega. O primeiro commit não é o início
do projeto: é o estado da aplicação **depois** da Fase 1 — o código anterior
às correções nunca foi versionado e não existe mais.

Isso está dito também no corpo do primeiro commit, para quem for ler o
histórico depois (incluindo a banca) não interpretar errado.

## Quando a Sarah for para produção

A branch `feat/guia-sarah` depende da **Migration 12**
(`20261005100000_guia_sarah_falas_vistas.sql`) estar aplicada no Supabase.
A ordem correta:

1. Aplicar a Migration 12 no banco de produção
2. `git checkout main && git merge feat/guia-sarah`
3. `git push origin main`
4. Publicar

Se o código subir antes da migration, o guia não quebra o app — ele degrada:
como não consegue gravar quais falas já foram vistas, a Sarah repete a
apresentação a cada navegação. Chato, não fatal. Mas a ordem acima evita isso.

## Nota sobre visibilidade do repositório

Se for público, lembre que o `README.md` e o histórico ficam visíveis para
qualquer pessoa — inclusive a banca, o que provavelmente é desejável. O que
**não** deve ficar público em hipótese alguma é o `.env.local` com as chaves
reais, e ele já está protegido pelo `.gitignore`. A chave `anon` do Supabase
é pública por construção (vai no bundle do navegador); quem protege os dados
é o RLS, já aplicado nas migrations.
