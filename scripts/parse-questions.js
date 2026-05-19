// Script to parse questions from the PDF text
// This will be used to populate the final_exam_questions table

const questions = [
  {
    question_number: 1,
    question_text: "O que significa pensar como piloto na lógica de pilotagem?",
    option_a: "Velocidade máxima em todas as curvas",
    option_b: "Antecipar o comportamento do carro e controlar a transferência de peso",
    option_c: "Usar sempre a mesma linha em qualquer pista",
    option_d: "Ignorar as condições climáticas durante a corrida",
    correct_answer: "B"
  },
  {
    question_number: 2,
    question_text: "Na transferência de peso durante uma curva, para onde o peso se transfere principalmente?",
    option_a: "Somente para a frente",
    option_b: "Para o meio do carro",
    option_c: "Para o lado oposto da curva",
    option_d: "Para trás e para cima",
    correct_answer: "C"
  },
  {
    question_number: 3,
    question_text: "Por que a suavidade é importante ao pilotar?",
    option_a: "Para economizar combustível",
    option_b: "Para evitar danos ao carro e melhorar a aderência",
    option_c: "Para acelerar mais rápido na reta",
    option_d: "Para impressionar outros pilotos",
    correct_answer: "B"
  },
  {
    question_number: 4,
    question_text: "Qual é a característica principal da mente do piloto, segundo o módulo de lógica de pilotagem?",
    option_a: "Buscar velocidade máxima independentemente da estabilidade",
    option_b: "Priorizar constância em vez de velocidade pura",
    option_c: "Concentrar-se apenas na saída da curva",
    option_d: "Focar em ultrapassagens arriscadas",
    correct_answer: "B"
  },
  {
    question_number: 5,
    question_text: "Por que a saída da curva é mais importante que a entrada?",
    option_a: "Porque permite acelerar mais cedo e manter maior velocidade na reta seguinte",
    option_b: "Porque a entrada não influencia o tempo da volta",
    option_c: "Porque a saída é sempre mais fácil de controlar",
    option_d: "Porque a entrada define a linha, não a saída",
    correct_answer: "A"
  },
  {
    question_number: 6,
    question_text: "Qual postura é recomendada para um piloto no cockpit?",
    option_a: "Rígida e tensa para melhor controle",
    option_b: "Relaxada, com mãos e pés posicionados corretamente",
    option_c: "Deitado para reduzir o cansaço",
    option_d: "Em pé para melhor visibilidade",
    correct_answer: "B"
  },
  // Continue with remaining questions...
  // Note: This is a sample. The full script would include all 240 questions
]

// Function to generate SQL insert statements
function generateInsertSQL() {
  return questions.map(q => {
    return `INSERT INTO final_exam_questions (question_number, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (${q.question_number}, '${q.question_text.replace(/'/g, "''")}', '${q.option_a.replace(/'/g, "''")}', '${q.option_b.replace(/'/g, "''")}', '${q.option_c.replace(/'/g, "''")}', '${q.option_d.replace(/'/g, "''")}', '${q.correct_answer}');`
  }).join('\n')
}

console.log(generateInsertSQL())
