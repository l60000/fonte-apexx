# Sistema de Prova Final - Como Funciona

## Visão Geral

O sistema de prova final foi projetado para avaliar os alunos ao final do curso com questões aleatórias de um banco de 240 perguntas sobre pilotagem.

## Componentes do Sistema

### 1. Banco de Questões
- **Localização**: `/public/240_questoes_pilotagem.pdf`
- **Total**: 240 questões de múltipla escolha (A, B, C, D)
- **Formato**: Cada questão contém pergunta, 4 opções e a resposta correta
- **Armazenamento**: Tabela `final_exam_questions` no banco de dados

### 2. Painel Administrativo
- **Rota**: `/admin/prova-final`
- **Funcionalidades**:
  - Visualizar total de questões no banco
  - Acompanhar resultados dos alunos em tempo real
  - Baixar PDF com todas as 240 questões
  - Ver estatísticas (aprovados vs reprovados)

### 3. Prova para Alunos
- **Rota**: `/dashboard/prova-final/[courseId]`
- **Como funciona**:
  1. Aluno acessa a página da prova
  2. Sistema verifica se já existe tentativa anterior
  3. Se não existe, gera automaticamente 30 questões aleatórias
  4. Questões são armazenadas para aquele aluno específico
  5. Aluno tem 2 horas para completar
  6. Ao submeter, sistema corrige automaticamente
  7. Resultado aparece instantaneamente

## Fluxo de Funcionamento

### Para o Aluno:

1. **Acesso**: Aluno clica em "Fazer Prova Final" no dashboard
2. **Geração**: Sistema sorteia 30 questões do banco de 240
3. **Realização**: Aluno responde as questões (2 horas de limite)
4. **Submissão**: Ao finalizar, clica em "Enviar Prova"
5. **Correção Automática**: Sistema compara respostas com gabarito
6. **Resultado**: 
   - Mostra quantos acertos (X/30)
   - Calcula porcentagem
   - Aprovado: ≥60% (18 acertos)
   - Reprovado: <60%

### Para o Admin:

1. **Monitoramento**: Acessa `/admin/prova-final`
2. **Visualização**: Vê todos os resultados em tempo real
3. **Relatório**: Cada resultado mostra:
   - Nome do aluno
   - Data/hora da prova
   - Nota (%) e número de acertos
   - Status (Aprovado/Reprovado)

## Estrutura do Banco de Dados

### Tabelas Principais:

1. **final_exam_questions**
   - Armazena as 240 questões
   - Campos: question_text, option_a, option_b, option_c, option_d, correct_answer

2. **final_exam_attempts**
   - Registra cada tentativa de prova
   - Campos: user_id, course_id, status, score, percentage, passed, submitted_at

3. **final_exam_attempt_questions**
   - Armazena as 30 questões específicas de cada aluno
   - Relaciona attempt_id com as questões sorteadas

## APIs Criadas

### POST `/api/final-exam/generate`
- Gera uma nova prova com 30 questões aleatórias
- Verifica se aluno já tem prova ativa
- Retorna ID da tentativa

### POST `/api/final-exam/submit`
- Recebe respostas do aluno
- Corrige automaticamente
- Calcula nota e aprovação/reprovação
- Atualiza banco de dados

## Regras Importantes

1. **Uma tentativa por aluno**: Cada aluno só pode fazer a prova uma vez
2. **Nota mínima**: 60% (18 de 30 questões corretas)
3. **Tempo limite**: 2 horas
4. **Questões únicas**: Cada aluno recebe 30 questões diferentes
5. **Correção automática**: Sem intervenção manual necessária

## Como Adicionar/Modificar Questões

Para adicionar ou modificar questões no banco:

1. Edite o arquivo `/scripts/016_populate_final_exam_questions.sql`
2. Adicione as questões no formato SQL INSERT
3. Execute o script no banco de dados
4. As novas questões estarão disponíveis imediatamente

## Acesso dos Alunos

Os alunos podem acessar a prova final:
- Através do dashboard principal
- Menu lateral: "Prova Final"
- Ou diretamente via URL: `/dashboard/prova-final/[id-do-curso]`

**Importante**: O aluno precisa estar matriculado e com acesso liberado (pagamento confirmado ou acesso concedido pelo admin) para fazer a prova.
