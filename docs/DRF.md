# Documento de Requisitos Funcionais Simplificado - AutNutry

## 1. Visão Geral

O AutNutry é uma aplicação web que tem como objetivo centralizar e otimizar a gestão de pacientes, planos de tratamento e comunicação para nutricionistas. A versão inicial (MVP) visa prover as ferramentas essenciais para a organização do consultório e preparar a infraestrutura para futuras automações de comunicação.

## 2. Requisitos Funcionais Detalhados (MVP)

### 2.1. Autenticação

* **RF001 - Login do Nutricionista:**
    * **Descrição:** O sistema deve permitir que o nutricionista faça login utilizando seu e-mail e senha cadastrados.
    * **Cenário de Uso:**
        * O nutricionista acessa a URL do aplicativo.
        * É apresentada uma tela de login com campos para e-mail e senha.
        * Ao inserir credenciais válidas e clicar em "Entrar", o nutricionista é redirecionado para o painel principal.
        * Ao inserir credenciais inválidas, uma mensagem de erro deve ser exibida.

### 2.2. Gestão de Pacientes

* **RF002 - Cadastrar Novo Paciente:**
    * **Descrição:** O nutricionista deve ser capaz de adicionar novos pacientes ao sistema.
    * **Campos:** Nome Completo, Data de Nascimento, Telefone (com DDD), E-mail, Observações.
    * **Cenário de Uso:**
        * No painel principal, o nutricionista clica em "Novo Paciente" ou similar.
        * Um formulário é exibido.
        * Após preencher os dados e salvar, o paciente é adicionado à lista e uma mensagem de sucesso é exibida.
* **RF003 - Listar Pacientes:**
    * **Descrição:** O sistema deve exibir uma lista de todos os pacientes cadastrados.
    * **Cenário de Uso:**
        * Ao acessar a seção de "Pacientes", uma tabela ou lista com os dados essenciais (Nome, Telefone, E-mail) de cada paciente é exibida.
        * A lista deve ser paginável ou ter uma barra de pesquisa se o número de pacientes for grande.
* **RF004 - Visualizar Detalhes do Paciente:**
    * **Descrição:** O nutricionista deve poder visualizar todos os detalhes de um paciente específico.
    * **Cenário de Uso:**
        * Ao clicar no nome de um paciente na lista, uma nova tela ou modal exibe todas as informações cadastradas para aquele paciente, incluindo planos e histórico de pagamentos/mensagens.
* **RF005 - Editar Paciente:**
    * **Descrição:** O nutricionista deve ser capaz de modificar as informações de um paciente existente.
    * **Cenário de Uso:**
        * Na tela de detalhes do paciente, um botão "Editar" permite que o nutricionista altere os campos.
        * Após salvar, as informações são atualizadas e uma mensagem de sucesso é exibida.
* **RF006 - Excluir Paciente:**
    * **Descrição:** O nutricionista deve ser capaz de remover um paciente do sistema.
    * **Cenário de Uso:**
        * Na lista ou tela de detalhes do paciente, um botão "Excluir" é apresentado.
        * Uma confirmação é solicitada antes da exclusão definitiva.

### 2.3. Gestão de Planos/Atributos do Paciente

* **RF007 - Associar Plano/Atributos ao Paciente:**
    * **Descrição:** O nutricionista deve poder associar informações sobre o plano ou tratamento específico de cada paciente.
    * **Campos:** Nome do Plano (texto livre ou seleção simples), Data de Início, Data de Término, Valor do Plano, Observações do Plano.
    * **Cenário de Uso:**
        * Na tela de detalhes do paciente, uma seção permite adicionar ou editar as informações do plano/atributos.

### 2.4. Controle Financeiro Básico

* **RF008 - Registrar Pagamento de Paciente:**
    * **Descrição:** O nutricionista deve poder registrar um pagamento recebido de um paciente.
    * **Campos:** Valor, Data do Pagamento, Forma de Pagamento (ex: Pix, Cartão, Dinheiro), Observações.
    * **Cenário de Uso:**
        * Na tela de detalhes do paciente, uma opção permite adicionar um novo registro de pagamento.
* **RF009 - Visualizar Resumo Financeiro:**
    * **Descrição:** O sistema deve apresentar um resumo básico dos pagamentos recebidos.
    * **Cenário de Uso:**
        * No painel principal ou em uma seção "Finanças", um card ou gráfico simples exibe o total de recebimentos por período (ex: mês atual).

### 2.5. Programação de Mensagens WhatsApp

* **RF010 - Criar Modelo de Mensagem:**
    * **Descrição:** O nutricionista deve poder criar e salvar modelos de mensagens para reuso.
    * **Campos:** Título do Modelo, Conteúdo da Mensagem (com suporte a placeholders como `{{nome_paciente}}`).
* **RF011 - Agendar Mensagem para Paciente:**
    * **Descrição:** O nutricionista deve poder agendar uma mensagem específica (usando um modelo ou digitando) para um paciente em uma data e hora futuras.
    * **Campos:** Paciente, Modelo de Mensagem (opcional), Conteúdo da Mensagem (se não usar modelo), Data de Envio, Hora de Envio.
    * **Cenário de Uso:**
        * Na tela de detalhes do paciente ou em uma seção "Mensagens", o nutricionista seleciona "Agendar Nova Mensagem".
        * Preenche os campos e salva.
* **RF012 - Visualizar Mensagens Agendadas:**
    * **Descrição:** O sistema deve exibir uma lista das mensagens agendadas, com status (agendada, enviada - manual, etc.).
* **RF013 - Envio Manual de Mensagem (MVP - Solução Inicial):**
    * **Descrição:** Para as mensagens agendadas, o sistema deve fornecer um botão ou link que, ao ser clicado, abra o WhatsApp Web/Desktop com a mensagem pré-preenchida para o número do paciente.
    * **Cenário de Uso:**
        * Na lista de mensagens agendadas, ao lado de cada mensagem, há um botão "Enviar via WhatsApp".
        * Ao clicar, uma nova aba ou janela é aberta com a URL do WhatsApp (`wa.me/numerodotelefone?text=mensagemcodificada`).
