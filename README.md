# 🚀 JobTriva

**Plataforma inteligente para análise de vagas e personalização de currículos.**

O **JobTriva** é uma aplicação web desenvolvida para auxiliar profissionais na busca por oportunidades de emprego, utilizando inteligência artificial para analisar requisitos de vagas, avaliar a compatibilidade com o perfil do candidato e facilitar a criação de currículos personalizados.

O projeto surgiu de uma necessidade pessoal: durante minha busca por oportunidades, percebi que adaptar o currículo para diferentes vagas exigia tempo e organização. A partir disso, decidi transformar esse problema em uma solução tecnológica.

## 🎯 Objetivo

Facilitar a organização de candidaturas e a apresentação das competências profissionais, utilizando inteligência artificial para destacar habilidades e experiências reais de acordo com os requisitos de cada oportunidade.

## ✨ Funcionalidades

- **Autenticação:** cadastro e login de usuários.
- **Perfil profissional:** gerenciamento de informações e competências.
- **Gerenciamento de vagas:** cadastro e organização de oportunidades.
- **Análise com IA:** avaliação de compatibilidade entre vagas e perfil profissional.
- **Currículos personalizados:** criação e gerenciamento de diferentes versões.
- **Visualização e impressão:** preparação de currículos para PDF.
- **Dashboard:** acompanhamento das informações do sistema.
- **Configurações:** personalização de preferências da aplicação.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| Next.js 14 | Framework web e lógica de servidor |
| React | Interface do usuário |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| PostgreSQL | Banco de dados relacional |
| Prisma ORM | Comunicação com o banco |
| Ollama | Execução local de modelos de IA |
| NextAuth.js | Autenticação |
| Node.js | Ambiente de execução |

## 🏗️ Arquitetura e funcionamento

O JobTriva integra interface web, processamento no servidor, banco de dados relacional e inteligência artificial executada localmente.

**Fluxo de funcionamento:**

1. O usuário cadastra seu perfil profissional e uma vaga.
2. A aplicação reúne as informações relevantes para a análise.
3. O backend encaminha os dados ao modelo de linguagem executado pelo Ollama.
4. A inteligência artificial auxilia na avaliação de compatibilidade.
5. Os resultados podem ser armazenados no PostgreSQL por meio do Prisma.
6. O usuário consulta a análise e pode gerar uma versão personalizada do currículo.

Essa estrutura permite organizar as informações e manter o histórico de versões de currículos.

## 💻 Como executar localmente

### Pré-requisitos

- Node.js e npm
- PostgreSQL
- Ollama
- Um modelo de linguagem compatível instalado no Ollama

### Instalação

**1. Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/JobTriva.git
cd JobTriva
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

**2. Instale as dependências**

```bash
npm install
```

**3. Configure o ambiente**

Crie um arquivo `.env` a partir do `.env.example` e configure as variáveis de ambiente com seus próprios dados locais.

**4. Prepare o banco de dados**

Crie um banco PostgreSQL para a aplicação e execute:

```bash
npx prisma generate
npx prisma db push
```

**5. Configure a inteligência artificial**

Inicie o Ollama e disponibilize o modelo de linguagem configurado para o projeto.

**6. Inicie a aplicação**

```bash
npm run dev
```

Acesse:

`http://localhost:3000`

## 🔐 Segurança e privacidade

O JobTriva foi desenvolvido para uso e demonstração local.

O repositório público não deve conter:

- Senhas ou credenciais reais.
- Arquivos `.env` privados.
- Bancos de dados e backups pessoais.
- Currículos e documentos com informações pessoais.
- Chaves de autenticação.

O arquivo `.env.example` apresenta apenas a estrutura de configuração necessária.

**Importante:** esta versão não foi preparada para implantação pública em produção. A disponibilização na internet exige uma avaliação adicional de segurança.

## 📊 Gestão e desenvolvimento do projeto

Além da programação, o desenvolvimento do JobTriva envolveu práticas de planejamento e organização de projetos:

- Levantamento de requisitos e definição de escopo.
- Planejamento e priorização de funcionalidades.
- Organização de etapas e entregas.
- Identificação de riscos técnicos.
- Testes funcionais e validação de resultados.
- Documentação e acompanhamento de melhorias.
- Avaliação de custos e alternativas de infraestrutura.

Um dos principais desafios foi a **migração do banco de dados de SQLite para PostgreSQL**, exigindo cuidados com backups, integridade dos dados e testes de funcionamento.

Essa experiência reforçou meu interesse pela **Gestão de Projetos**, área na qual pretendo unir meus conhecimentos tecnológicos às habilidades de planejamento, organização e tomada de decisões.

## 📌 Status

**Projeto pessoal em desenvolvimento e refinamento local.**

As principais funcionalidades foram implementadas e testadas em ambiente local. O projeto permanece aberto a melhorias de usabilidade, organização e qualidade.

## 👨‍💻 Autor

**José Roberto da Silva Filho**

Estudante de Análise e Desenvolvimento de Sistemas, com interesse em tecnologia, processos e Gestão de Projetos.

---

**JobTriva — Da identificação de um problema à construção de uma solução.**
