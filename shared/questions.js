export const CHAPTERS = {
  h3: {
    title: "Economie",
    subtitle: "Basis begrippen"
  }
};

const QUESTIONS = [
  {
    id: 1,
    type: "multiple",
    prompt: "Wat is inflatie?",
    options: [
      "Prijsstijging van producten",
      "Daling van prijzen",
      "Meer export",
      "Meer productie"
    ],
    correctIndex: 0
  },
  {
    id: 2,
    type: "multiple",
    prompt: "Wat betekent vraag?",
    options: [
      "Hoeveel bedrijven produceren",
      "Hoeveel consumenten willen kopen",
      "Hoeveel belasting je betaalt",
      "Hoeveel winst een bedrijf maakt"
    ],
    correctIndex: 1
  },
  {
    id: 3,
    type: "multiple",
    prompt: "Wat betekent aanbod?",
    options: [
      "Wat bedrijven willen verkopen",
      "Wat consumenten kopen",
      "Wat banken uitlenen",
      "Wat de overheid koopt"
    ],
    correctIndex: 0
  }
];

export function generateQuestionSet(chapterId, count = 10) {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
