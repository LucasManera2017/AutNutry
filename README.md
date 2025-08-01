# AutNutry

## Descrição

O App Nutricionista é uma ferramenta web projetada para auxiliar nutricionistas no gerenciamento de seus pacientes, planos de tratamento e na automação da comunicação via WhatsApp. A primeira versão (MVP) foca na organização essencial do consultório, preparando o terreno para funcionalidades de comunicação mais avançadas.

## Funcionalidades Principais (MVP)

* **Autenticação de Usuário:** Login seguro para nutricionistas.
* **Gestão de Pacientes:** Cadastro, listagem, visualização, edição e exclusão de informações de pacientes.
* **Associação de Atributos/Planos:** Vincular pacientes a planos ou características específicas de tratamento.
* **Controle Financeiro Básico:** Registro e visualização simplificada de pagamentos de pacientes.
* **Programação de Mensagens WhatsApp:** Criação de modelos de mensagens e agendamento para envio futuro (o envio automático será implementado em fases posteriores).

## Tecnologias Utilizadas

* **Front-end:**
    * React (Biblioteca JavaScript)
    * Tailwind CSS (Framework CSS para estilização)
    * HTML5, CSS3, JavaScript
* **Back-end & Banco de Dados:**
    * Supabase (BaaS - Backend as a Service)
        * PostgreSQL (Banco de Dados Relacional)
        * Autenticação de Usuários
        * Funções Serverless (para futura integração com WhatsApp API)

## Como Rodar o Projeto Localmente

### Pré-requisitos

* Node.js (versão 18 ou superior)
* npm (gerenciador de pacotes do Node.js)
* Conta no Supabase e um projeto configurado (com as tabelas e políticas de segurança iniciais)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd app-nutricionista
    ```
2.  **Instale as dependências do Front-end:**
    ```bash
    cd frontend # Ou o nome da pasta do seu front-end
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na pasta `frontend` (ou onde o seu front-end estiver) com as seguintes variáveis (substitua pelos seus dados do Supabase):
    ```
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
    ```
4.  **Inicie o servidor de desenvolvimento do Front-end:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173` (ou outra porta indicada).

## Estrutura de Pastas (Proposta Inicial)

A estrutura do projeto autNutry é organizada da seguinte forma:

| Caminho                   | Descrição                                                                      |
| :------------------------ | :----------------------------------------------------------------------------- |
| `autNutry/`               | **Diretório raiz do projeto.** |
| ├── `frontend/`           | Código do aplicativo **React** construído com **Vite**.                        |
| │   ├── `public/`         | Contém arquivos estáticos, como `index.html`.                                |
| │   ├── `src/`            | **Código fonte principal do React.** |
| │   │   ├── `assets/`     | Imagens, ícones e arquivos de estilo globais (ex: `index.css`).              |
| │   │   ├── `components/` | Componentes React reutilizáveis.                                               |
| │   │   ├── `pages/`      | Páginas/Rotas principais do aplicativo.                                        |
| │   │   ├── `App.tsx`     | Componente principal do aplicativo.                                            |
| │   │   ├── `main.tsx`    | Ponto de entrada da aplicação React.                                           |
| │   │   ├── `services/`   | Funções para integração com **Supabase** e outras APIs externas.             |
| │   │   └── `hooks/`      | Custom hooks React para lógica reutilizável.                                   |
| │   ├── `.env.example`    | Exemplo de variáveis de ambiente necessárias para a configuração do projeto.  |
| │   ├── `package.json`    | Define as dependências do Node.js e scripts do projeto.                        |
| │   ├── `tailwind.config.js` | Configuração do **Tailwind CSS**.                                              |
| │   ├── `postcss.config.js` | Configuração do PostCSS, usado pelo Tailwind CSS.                              |
| │   └── `vite.config.ts`  | Configurações específicas do **Vite**.                                         |
| ├── `docs/`               | **Documentação detalhada do projeto.** |
| │   └── `DRF.md`          | **Documento de Requisitos Funcionais** do projeto.                             |
| ├── `.gitignore`          | Arquivos e pastas a serem ignorados pelo controle de versão do Git.            |
| └── `README.md`           | Este arquivo de documentação do projeto.    


## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais 
