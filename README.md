# Edital em Ação 🎯

> **"Do edital à oportunidade, sem se perder no caminho."**  
> *Aplicação fullstack desenvolvida conforme os requisitos do programa **Recode Pro AI** e alinhada ao **ODS 10 (Redução das Desigualdades)**.*

---

## 📌 Visão Geral do Produto

O **Edital em Ação** é uma plataforma web desenvolvida para auxiliar estudantes e candidatos a compreenderem editais complexos de bolsas de estudo, auxílios estudantis, cursos de capacitação e programas de oportunidade.

A plataforma elimina as barreiras da linguagem burocrática e excesso de páginas:
1. **Extrai texto de PDFs reais** com preservação da estrutura.
2. **Identifica e categoriza requisitos** (elegibilidade, documentos, prazos e etapas).
3. **Confronta os critérios com o perfil minimizado do usuário**, fornecendo uma avaliação puramente **orientativa** (*Parece atendido*, *Não parece atendido*, *Precisa confirmar* ou *Não se aplica*).
4. **Transforma exigências em um Plano de Ação (Checklist interativo)** acompanhável com prioridades e prazos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** ReactJS 18 + Vite + JavaScript (ES Modules), React Router v6, Lucide Icons e Vanilla CSS customizado (sem frameworks genéricos, seguindo a paleta oficial: Azul-Marinho `#18324B`, Verde-Petróleo `#287A72` e Fundo Claro `#F4F6F8`).
- **Backend:** Node.js + Express, arquitetura RESTful organizada em camadas (rotas, controladores, serviços, repositórios, validadores, intermediários e utilitários).
- **Banco de Dados:** MySQL 8.0 (InnoDB, `utf8mb4_unicode_ci`, prepared statements com `mysql2/promise`, chaves estrangeiras e integridade referencial com exclusão em cascata coerente).
- **Extração de Documentos:** `pdf-parse` com validação de tipos MIME e limite de 10 MB.
- **Inteligência Artificial:** SDK oficial `@google/genai` (Google Gemini) com chave opcional e motor heurístico de regras locais transparente para execução sem necessidade de chave de API.
- **Validação de Dados:** `zod` em todos os endpoints HTTP.

---

## 📂 Estrutura de Pastas do Repositório

```text
c:\Edital em ação\
├── database/
│   ├── schema.sql                 # Criação do banco, tabelas, FKs e índices
│   └── seed.sql                   # Dados de demonstração realistas
├── backend/
│   ├── .env.example               # Modelo de variáveis de ambiente
│   ├── .env                       # Variáveis locais (credenciais do MySQL e IA)
│   ├── package.json               # Dependências e scripts do servidor
│   ├── uploads/                   # Armazenamento local de PDFs sanitizados
│   ├── testes/
│   │   ├── executarTestes.js      # Suíte de testes automatizados (T0 a T7)
│   │   └── testarUploadPdf.js     # Teste de upload e extração real de PDF (T4 e T5)
│   └── src/
│       ├── servidor.js            # Ponto de entrada e inicialização do Express
│       ├── app.js                 # Configuração do Express, CORS, Helmet e rotas
│       ├── configuracao/          # Carregamento de ambiente e pool MySQL
│       ├── controladores/         # Controladores das entidades
│       ├── intermediarios/        # Middlewares de erro e upload Multer
│       ├── repositorios/          # Consultas SQL parametrizadas
│       ├── rotas/                 # Definição dos endpoints RESTful (/api/*)
│       ├── scripts/
│       │   └── inicializarBanco.js# Script automatizado para rodar schema e seed
│       ├── servicos/              # Regras de negócio, PDF e integração Gemini
│       ├── utilitarios/           # Sanitização de arquivos e normalização de datas
│       └── validadores/           # Schemas Zod de validação
├── frontend/
│   ├── .env.example               # Configuração da URL base da API
│   ├── .env                       # VITE_API_BASE_URL
│   ├── package.json               # Dependências e scripts do cliente
│   ├── vite.config.js             # Configuração do Vite (porta 5173)
│   ├── index.html                 # HTML semântico com fontes Google Fonts
│   └── src/
│       ├── main.jsx               # Ponto de entrada do React
│       ├── App.jsx                # Roteamento e layout com Navbar e Rodapé
│       ├── componentes/           # Componentes reutilizáveis (Botao, Cartao, etc.)
│       ├── estilos/
│       │   └── index.css          # Design system completo e responsivo
│       ├── paginas/               # Painel, Editais, Perfil, Análise, Plano de Ação, Sobre
│       ├── servicos/
│       │   └── api.js             # Cliente HTTP centralizado
│       └── utilitarios/
│           └── formatadores.js    # Formatação de datas em pt-BR e status
├── .gitignore                     # Proteção de .env, node_modules e uploads
└── README.md                      # Documentação completa de uso
```

---

## 🚀 Passo a Passo para Execução Local

### 1. Pré-requisitos
- **Node.js**: Versão 20 LTS ou superior instalada (`node -v`).
- **npm**: Versão 10 ou superior (`npm -v`).
- **MySQL Server 8.0**: Em execução no computador (`localhost:3306`).

### 2. Configurar o Banco de Dados MySQL
1. Abra o arquivo `backend/.env` e configure sua senha local do MySQL na variável `DB_PASSWORD`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha_aqui
   DB_NAME=edital_em_acao
   ```
2. No diretório `backend`, execute o script automático de criação do banco e inserção do seed:
   ```bash
   cd backend
   npm run db:init
   ```
   *(Este comando executa automaticamente `database/schema.sql` e `database/seed.sql` no MySQL).*

### 3. Instalar Dependências e Iniciar o Backend
1. No terminal, dentro da pasta `backend`:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. O servidor iniciará em: **`http://localhost:3001`**
3. Endpoint de saúde para verificação: **`http://localhost:3001/api/health`**

### 4. Instalar Dependências e Iniciar o Frontend
1. Em outro terminal, acesse a pasta `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Abra seu navegador em: **`http://localhost:5173/`**

---

## 🧪 Como Executar a Suíte de Testes Automatizados

No diretório `backend`, execute:
```bash
npm test
```
A suíte executa e valida os seguintes casos de teste:
- **T0:** Conexão com o banco MySQL e endpoint `/api/health`.
- **T1:** CRUD de Editais (criação, consulta, alteração de título e exclusão com persistência no MySQL).
- **T2:** CRUD de Perfis (validação com campos obrigatórios e aceitação de campos opcionais nulos).
- **T3:** Análise orientativa com geração automática de tarefas no checklist.
- **T4:** Upload de PDF válido com extração real de texto via `pdf-parse` (extração de 12 páginas e 32.616 caracteres).
- **T5:** Rejeição segura de arquivos de formato inválido (HTTP 415/400).
- **T6:** Operações do checklist (alternância de status de tarefa entre pendente e concluída).
- **T7:** Integridade referencial e exclusão em cascata sem deixar registros órfãos no banco.

---

## 🔑 Configuração Opcional da Chave de IA (Google Gemini)

A aplicação funciona **completamente sem necessidade de chave de API**, utilizando seu motor heurístico de regras locais e os dados de demonstração.

Caso deseje habilitar a análise assistida por IA avançada:
1. Acesse o **Google AI Studio**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Crie uma chave de API gratuita para o Gemini.
3. Abra o arquivo `backend/.env` e cole sua chave na variável:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Reinicie o backend (`npm start`). A aplicação passará a processar análises com o modelo configurado sem expor o segredo no navegador.

---

## 🛡️ Dados de Demonstração Pré-Carregados

O script `database/seed.sql` insere registros claramente identificados como demonstração:
- **Edital Modelo:** `[DEMONSTRAÇÃO] Programa Bolsa Permanência Universitária 2026/1` (FUAE).
- **Perfil Modelo:** `Maria Eduarda Silva (Perfil Demonstração)` - Graduação em Engenharia de Software, Renda até 1,5 salário mínimo.
- **Análise Pré-Cadastrada:** Demonstração orientativa com 6 critérios extraídos, evidências literais e plano de ação correspondente.

---

## ⚠️ Limitações Conhecidas

1. **PDFs sem camada de texto (Digitalizações/Fotos):** Não há suporte a OCR no MVP. Se um PDF for apenas imagem, o sistema rejeitará informando que é necessário um documento com texto selecionável.
2. **Caráter Orientativo:** Conforme a especificação, o resultado da plataforma não constitui aprovação legal, recurso oficial ou garantia de benefício perante as instituições responsáveis.
