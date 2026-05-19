# Configuração do Stripe

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu arquivo `.env.local` ou nas configurações de ambiente do Vercel:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Como Obter as Chaves do Stripe

### 1. Chaves de API (STRIPE_SECRET_KEY e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em **Developers** → **API keys**
3. Copie:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

⚠️ **Importante**: Use as chaves de **test** durante o desenvolvimento e as chaves de **live** apenas em produção.

### 2. Webhook Secret (STRIPE_WEBHOOK_SECRET)

#### Desenvolvimento Local (usando Stripe CLI)

1. Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Faça login:
```bash
stripe login
```

3. Inicie o webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. O CLI mostrará o webhook secret (whsec_...) - copie esse valor para `STRIPE_WEBHOOK_SECRET`

#### Produção (Vercel)

1. No Dashboard do Stripe, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.vercel.app/api/webhooks/stripe`
   - **Events to send**: Selecione:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
4. Clique em **Add endpoint**
5. Na página do webhook, clique em **Reveal** no campo "Signing secret"
6. Copie o valor (whsec_...) para `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente do Vercel

## Testando Pagamentos

### Cartões de Teste

Use estes números de cartão para testar:

- **Pagamento bem-sucedido**: `4242 4242 4242 4242`
- **Pagamento recusado**: `4000 0000 0000 0002`
- **Autenticação 3D Secure**: `4000 0025 0000 3155`

**Detalhes adicionais para testes:**
- Qualquer data de validade futura (ex: 12/34)
- Qualquer CVC de 3 dígitos (ex: 123)
- Qualquer CEP (ex: 12345)

## Fluxo de Pagamento

1. Usuário se matricula em um curso
2. Aplicação cria uma sessão de checkout no Stripe
3. Usuário é redirecionado para página de pagamento do Stripe
4. Após pagamento:
   - **Sucesso**: Webhook `checkout.session.completed` é disparado
     - Matrícula é criada no banco de dados
     - Usuário recebe acesso ao curso
     - Redirecionado para `/pagamento/sucesso`
   - **Cancelado**: Usuário é redirecionado para `/pagamento/cancelado`

## Verificando Webhooks

Para ver os logs dos webhooks:

1. Dashboard do Stripe → **Developers** → **Webhooks**
2. Clique no seu endpoint
3. Veja a aba **Events & logs**

## Solução de Problemas

### Webhook não está funcionando

- Verifique se `STRIPE_WEBHOOK_SECRET` está configurado corretamente
- Confirme que o endpoint está acessível publicamente (em produção)
- Verifique os logs no Dashboard do Stripe

### Pagamento não cria matrícula

- Verifique se o webhook `checkout.session.completed` está sendo recebido
- Confira os logs do servidor para erros de banco de dados
- Certifique-se de que os metadados (course_id, user_id) estão sendo enviados corretamente

### Erro de permissão no Supabase

- Verifique se as políticas RLS da tabela `enrollments` permitem inserção
- Confirme que a tabela `payments` existe e tem as políticas corretas

## Suporte

Para mais informações, consulte:
- [Documentação do Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
