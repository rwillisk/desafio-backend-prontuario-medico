# Estratégia de Testes

Este projeto utiliza uma abordagem híbrida de testes, combinando testes automatizados para garantia de qualidade contínua e roteiros manuais para exploração e validação de aceitação.

---

## 🤖 Testes Automatizados (Jest)

A suíte de testes automatizados cobre as regras de negócio mais críticas e garante que refatorações não quebrem funcionalidades existentes.

### Como rodar
```bash
npm test
```

### O que é testado automaticamente
- **Services**: Lógica de negócios isolada (ex: conflito de horário, regras de anonimização) usando Repositórios em Memória.
- **DTOs**: Validação de entrada de dados (schemas Zod).

Exemplos de casos cobertos:
- Impedir cadastro de paciente com email duplicado.
- Impedir agendamento em data passada.
- Impedir agendamento em horário já ocupado.
- Garantir que anonimização remove dados sensíveis.

---

## 🖐️ Roteiro de Testes Manuais (via Swagger)

Para validação manual e visual, recomendamos utilizar o **Swagger UI** (`http://localhost:3000/api`). Lembre-se de **autenticar** (`POST /login` + botão Authorize) antes de testar as rotas protegidas.

### 1. Pacientes

- **Criar paciente com dados válidos**
  - **Rota**: `POST /patients`
  - **Ação**: Enviar payload completo.
  - **Resultado Esperado**: Status 201 e JSON do paciente criado.

- **Tentar criar paciente duplicado**
  - **Rota**: `POST /patients`
  - **Ação**: Tentar criar outro paciente com o mesmo email.
  - **Resultado Esperado**: Status 400 e mensagem de erro "Patient already exists".

- **Listar pacientes**
  - **Rota**: `GET /patients`
  - **Resultado Esperado**: Status 200 com array de pacientes.

- **Atualizar paciente**
  - **Rota**: `PUT /patients/{id}`
  - **Ação**: Alterar o nome ou telefone.
  - **Resultado Esperado**: Status 200 e dados atualizados.

- **Anonimizar paciente (LGPD)**
  - **Rota**: `DELETE /patients/{id}`
  - **Cenário**: Paciente com agendamentos.
  - **Resultado Esperado**: Status 204. Os dados pessoais (nome, email, telefone) devem ser removidos do banco, mas o ID e o histórico de consultas devem permanecer.

---

### 2. Agendamentos

- **Criar agendamento válido**
  - **Rota**: `POST /appointments`
  - **Ação**: `patientId` válido, data futura (ex: `2026-12-25T10:00:00Z`).
  - **Resultado Esperado**: Status 201.

- **Impedir data no passado**
  - **Rota**: `POST /appointments`
  - **Ação**: Enviar data passada.
  - **Resultado Esperado**: Status 400 (Erro de validação).

- **Impedir conflito de horário**
  - **Rota**: `POST /appointments`
  - **Cenário**: Tentar agendar para o mesmo dia e hora (ex: `10:15`) onde já existe agendamento (`10:00` às `11:00`).
  - **Resultado Esperado**: Status 400 "Appointment time slot is not available".

- **Listar agendamentos de um paciente**
  - **Rota**: `GET /patients/{id}/appointments`
  - **Resultado Esperado**: Lista das consultas históricas deste paciente, incluindo campo `notes`.

- **Excluir agendamento**
  - **Rota**: `DELETE /appointments/{id}`
  - **Resultado Esperado**: Status 204.
