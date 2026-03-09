export function generateQuestions(topic, count) {

  const questions = [];

  for (let i = 0; i < count; i++) {

    questions.push({
      id: i,
      prompt: `Vraag ${i + 1} over ${topic}`,
      options: [
        "Antwoord A",
        "Antwoord B",
        "Antwoord C",
        "Antwoord D"
      ],
      correctIndex: Math.floor(Math.random() * 4)
    });

  }

  return questions;

}
