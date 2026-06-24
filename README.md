<div align="center">

# 🌿 GERMINA
### Documentação do Projeto

**Germinar conhecimentos sobre Plantas Medicinais usando a Tecnologia**

<br/>

![ICET-UFAM](https://img.shields.io/badge/ICET--UFAM-2C5F2D?style=flat-square)
![Engenharia de Software](https://img.shields.io/badge/Engenharia%20de%20Software%20I-4CAF50?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap%205-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-1C5C8A?style=flat-square)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=flat-square)
![Sprint](https://img.shields.io/badge/SPRINT%201-0075CA?style=flat-square)
![FAPEAM](https://img.shields.io/badge/Bolsista%20FAPEAM-2026-9C27B0?style=flat-square)

</div>

---

Repositório de documentação do projeto **GERMINA**, uma aplicação web gamificada para democratizar o acesso ao conhecimento científico e tradicional sobre plantas medicinais da Amazônia.

---

## Sobre o Projeto

O GERMINA é desenvolvido em parceria entre o **Programa de Pós-Graduação em Ciências, Tecnologia e Saúde (UFAM/ICET)** e o curso de **Engenharia de Software I (ICET-UFAM)**, com apoio da **FAPEAM**.

O sistema tem como objetivo principal disponibilizar, de forma acessível e engajante, informações científicas e populares sobre espécies medicinais presentes no **Horto Municipal de Itacoatiara/AM**, utilizando elementos de gamificação (pontuação, desafios e feedback) para engajar a comunidade no cuidado à saúde.

---

## Contexto Acadêmico

| Campo | Informação |
|---|---|
| **Pesquisadora principal** | Sarah Batista de Freitas |
| **Formação** | Ciências Biológicas — UFAM/AM |
| **Programa** | Mestrado em Ciências, Tecnologia e Saúde — UFAM/ICET |
| **Fomento** | Bolsista FAPEAM — 2026 |
| **Locus da pesquisa** | Horto Municipal de Itacoatiara/AM |
| **Parceria técnica** | Engenharia de Software I — ICET/UFAM |

---

## Metodologia

A pesquisa é de natureza **qualitativa, exploratória e descritiva** (Severino, 2017), com delineamento **longitudinal e prospectivo**. A coleta de dados é dividida em duas frentes:

- **Mapeamento bibliográfico** — levantamento em bases científicas (PubMed, SciELO, Google Scholar) sobre uso popular e farmacológico das espécies medicinais do Horto.
- **Entrevistas não diretivas** — realizadas com profissionais e gestores do Horto de Itacoatiara para captar conhecimentos práticos por meio do discurso livre.

A eficácia da ferramenta será validada por um **Comitê Ad Hoc** composto por especialistas das áreas envolvidas.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 14 + Bootstrap 5 |
| **Banco de dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Deploy** | Vercel |
| **Mobile** | PWA (Progressive Web App) — sem necessidade de publicação nas lojas |

> A aplicação usa responsividade via Bootstrap 5 para funcionar em desktop, tablet e celular a partir de um único código-base. O PWA permite que usuários instalem o app diretamente pelo navegador, sem passar pela Play Store ou App Store.

---

## Estrutura do Repositório

```
germina-docs/
├── Apresentacao/
│   └── Roteiro          # Roteiro de demo para a apresentação
├── Banco-de-dados/
│   ├── Modelo-logico    # Modelo lógico do banco de dados
│   └── Modelo-conceitual # Modelo conceitual (entidades e relacionamentos)
├── Codigo-fonte/
│   ├── Backend          # Documentação da API e lógica de servidor
│   ├── Banco-de-dados   # Scripts SQL e configuração do Supabase
│   ├── Front-end        # Componentes, páginas e estrutura Next.js
│   └── Visao-geral      # Decisões técnicas e arquitetura geral
├── LICENSE
└── README.md
```

---

## Funcionalidades do Sistema

- **Biblioteca de plantas medicinais** — catálogo com busca, filtros e fichas detalhadas por espécie
- **Diagnóstico inteligente** — sugestão de plantas a partir de sintomas informados pelo usuário
- **Gamificação** — sistema de XP, ranking, conquistas, badges e salas de evolução (quiz)
- **Comunidade** — feed de posts, comentários e interação entre usuários
- **Perfil do usuário** — histórico, conquistas e progresso de aprendizado

---

## Diagrama de Arquitetura

A arquitetura do sistema segue o modelo **C4 — Nível 2 (Containers)**, desenvolvido como parte da disciplina de Engenharia de Software I (ICET-UFAM), Sprint 1.

> O diagrama completo está disponível em `Banco-de-dados/Modelo-conceitual`.

---

## Como Contribuir com o Conteúdo

A pesquisadora Sarah Batista pode contribuir diretamente com o catálogo de plantas editando o arquivo `Codigo-fonte/Banco-de-dados`, sem necessidade de conhecimento técnico em programação. O formato utilizado é uma planilha `.csv` com os campos:

```
nome_popular, nome_cientifico, familia, uso_medicinal, indicacoes, contraindicacoes, imagem_url
```

---

## Referências

SEVERINO, Antônio Joaquim. **Metodologia do trabalho científico**. 24. ed. rev. e atual. São Paulo: Cortez, 2017.

---

<p align="center">
  Desenvolvido em colaboração entre UFAM/ICET · Engenharia de Software I · FAPEAM · 2026
</p>
