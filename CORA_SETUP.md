# Configuração da API Cora para Pagamentos

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis de ambiente ao seu projeto:

```env
CORA_API_URL=https://api.stage.cora.com.br/v2
CORA_CLIENT_ID=app-teste-doc
CORA_CLIENT_SECRET=81d231f4-f8e5-4b52-9c08-24dc45321a16
CORA_API_KEY=int-qRBmlAZgiSx00M6sxSrgj
```

## Como Adicionar no Vercel

1. Vá em **Settings** → **Environment Variables**
2. Adicione cada variável:
   - Nome: `CORA_API_URL`
   - Valor: `https://api.stage.cora.com.br/v2`
   - Clique em **Add**
3. Repita para todas as variáveis acima

## Fluxo de Pagamento Implementado

### 1. Criação do Boleto
- Usuário preenche dados na página `/matricula`
- Sistema chama API Cora para gerar invoice (boleto)
- Retorna código do boleto e linha digitável

### 2. Visualização do Boleto
- Usuário é redirecionado para `/pagamento/boleto?payment=ID`
- Página mostra:
  - Código de barras
  - Linha digitável (copiável)
  - Valor do pagamento
  - Data de vencimento
  - Botões para copiar e baixar PDF

### 3. Confirmação de Pagamento
- Sistema consulta status via webhook ou polling
- Quando pago, cria enrollment automático
- Usuário recebe acesso ao curso

## Estrutura do Banco de Dados

### Tabela: payments
```sql
- id: UUID
- user_id: UUID (ref users)
- course_id: UUID (ref courses)
- amount: DECIMAL
- status: TEXT (pending, paid, failed, cancelled)
- payment_method: TEXT (cora_invoice)
- cora_invoice_id: TEXT
- cora_code: TEXT
- digitable_line: TEXT
- created_at: TIMESTAMP
- paid_at: TIMESTAMP
```

### Tabela: payment_attempts
```sql
- id: UUID
- payment_id: UUID (ref payments)
- attempt_type: TEXT (create, check, webhook)
- request_data: JSONB
- response_data: JSONB
- success: BOOLEAN
- created_at: TIMESTAMP
```

## Endpoints da API

### POST `/api/payment/cora`
Cria um novo pagamento via boleto Cora

**Request:**
```json
{
  "courseId": "uuid",
  "userData": {
    "fullName": "Nome Completo",
    "birthDate": "2000-01-01",
    "cpf": "000.000.000-00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": 47.99,
    "cora_code": "meu_id",
    "digitable_line": "00190000090320204...",
    "status": "pending"
  }
}
```

### GET `/api/payment/cora?paymentId=UUID`
Consulta o status de um pagamento

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "status": "pending",
    "amount": 47.99,
    "digitable_line": "00190000090320204...",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

## Testando a Integração

1. **Criar um curso**
   - Acesse `/admin/cursos`
   - Crie um curso com preço definido

2. **Fazer matrícula**
   - Acesse `/cursos`
   - Clique em "Fazer Matrícula"
   - Preencha os dados e clique em "Continuar"

3. **Verificar boleto**
   - Você será redirecionado para `/pagamento/boleto`
   - Copie a linha digitável
   - Simule o pagamento no ambiente stage da Cora

4. **Confirmar pagamento**
   - O sistema verificará o status automaticamente
   - Quando pago, o enrollment será criado
   - Usuário terá acesso ao curso

## API Cora - Endpoints Utilizados

### POST `/v2/invoices`
Cria uma nova invoice (boleto)

**Headers:**
```
client-id: app-teste-doc
client-secret: 81d231f4-f8e5-4b52-9c08-24dc45321a16
api-key: int-qRBmlAZgiSx00M6sxSrgj
```

**Body:**
```json
{
  "code": "unique_code",
  "customer": {
    "name": "Nome do Cliente",
    "document": "00000000000"
  },
  "amount": 4799,
  "due_date": "2024-12-31"
}
```

### GET `/v2/invoices/{id}`
Consulta o status de uma invoice

**Response:**
```json
{
  "id": "invoice_id",
  "code": "meu_id",
  "status": "pending",
  "amount": 4799,
  "digitable_line": "00190000090320204...",
  "due_date": "2024-12-31",
  "paid_at": null
}
```

## Tratamento de Erros

A API retorna erros no formato:
```json
{
  "code": "invalid_request",
  "message": "Request has invalid parameters",
  "errors": [
    {
      "id": "person.identity",
      "message": "must not be empty"
    }
  ]
}
```

O sistema loga todos os erros e tentativas na tabela `payment_attempts` para auditoria.

## Próximos Passos

1. Configure as variáveis de ambiente
2. Teste a criação de boletos
3. Configure webhooks da Cora (opcional)
4. Em produção, altere `CORA_API_URL` para `https://api.cora.com.br/v2`
