export type ExamQuestionClient = {
  question_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

export function toClientQuestions(
  rows: Array<{
    id: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
  }>,
): ExamQuestionClient[] {
  return rows.map((q) => ({
    question_id: q.id,
    question: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
  }))
}

/** Converte respostas do formulário (índice → letra) para array ordenado. */
export function normalizeAnswers(
  answers: Record<string, string> | string[],
  total: number,
): string[] {
  if (Array.isArray(answers)) {
    return answers.slice(0, total)
  }
  return Array.from({ length: total }, (_, i) => answers[String(i)] || "")
}
