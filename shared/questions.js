export const CHAPTERS = {
  h3: {
    id: "h3",
    title: "Hoofdstuk 3",
    subtitle: "De bank en jouw geld"
  },
  h4: {
    id: "h4",
    title: "Hoofdstuk 4",
    subtitle: "Kies je voor zekerheid"
  },
  h5: {
    id: "h5",
    title: "Hoofdstuk 5",
    subtitle: "Is er werk voor jou"
  },
  h6: {
    id: "h6",
    title: "Hoofdstuk 6",
    subtitle: "Productie en markt"
  }
};

const mc = (id, prompt, options, correctIndex) => ({
  id,
  type: "multiple_choice",
  prompt,
  options,
  correctIndex
});

const tf = (id, prompt, correctIndex) => ({
  id,
  type: "true_false",
  prompt,
  options: ["Waar", "Niet waar"],
  correctIndex
});

const quick = (id, prompt, options, correctIndex) => ({
  id,
  type: "quick_fire",
  prompt,
  options,
  correctIndex
});

export const QUESTION_BANK = {
  h3: [
    mc("h3-1", "Wat is een belangrijke functie van een bank?", ["Geld bewaren", "Producten maken", "Belasting innen", "Huizen bouwen"], 0),
    mc("h3-2", "Wat is rente bij lenen?", ["Geld dat je betaalt voor een lening", "Gratis geld", "Een belasting", "Een korting"], 0),
    mc("h3-3", "Waar zet je geld op dat je even niet nodig hebt?", ["Spaarrekening", "Kassa", "Portemonnee", "Factuur"], 0),
    tf("h3-4", "Met internetbankieren kun je thuis je saldo bekijken.", 0),
    tf("h3-5", "Pinnen betekent dat je geld leent van de winkel.", 1),
    mc("h3-6", "Wat heb je meestal nodig om online te bankieren?", ["Inloggegevens", "Een kassabon", "Een winkelmand", "Een folder"], 0),
    quick("h3-7", "Hoe noem je geld dat automatisch van je rekening afgaat?", ["Incasso", "Loon", "Spaargeld", "Winst"], 0),
    quick("h3-8", "Hoe heet het overzicht van geld op je rekening?", ["Saldo", "Premie", "Aandeel", "Budget"], 0),
    mc("h3-9", "Waarom is sparen handig?", ["Voor onverwachte kosten", "Om meer belasting te betalen", "Zodat je geen bankpas nodig hebt", "Om schulden te krijgen"], 0),
    tf("h3-10", "Bij rood staan geef je meer uit dan er op je rekening staat.", 0),
    mc("h3-11", "Wat gebruik je om contactloos te betalen?", ["Bankpas of telefoon", "Verzekeringspas", "Bibliotheekpas", "Schoolpas"], 0),
    quick("h3-12", "Welk woord hoort bij veilig omgaan met je pincode?", ["Geheim", "Openbaar", "Grappig", "Nutteloos"], 0)
  ],
  h4: [
    mc("h4-1", "Waarom sluit je een verzekering af?", ["Voor zekerheid bij schade", "Om spullen te verkopen", "Om rente te krijgen", "Om belasting te vermijden"], 0),
    mc("h4-2", "Wat is premie?", ["Bedrag dat je voor je verzekering betaalt", "Het geld dat je altijd terugkrijgt", "Een boete", "De waarde van je huis"], 0),
    tf("h4-3", "Een verzekering is bedoeld voor risico's die je zelf lastig kunt betalen.", 0),
    tf("h4-4", "Iedere schade wordt altijd volledig vergoed.", 1),
    mc("h4-5", "Wat betekent eigen risico?", ["Een deel betaal je zelf", "Je krijgt extra winst", "Je betaalt nooit iets", "Je spaart automatisch"], 0),
    quick("h4-6", "Welke verzekering is verplicht voor een auto?", ["WA", "Reisverzekering", "Inboedelverzekering", "Annuleringsverzekering"], 0),
    mc("h4-7", "Welke verzekering past bij spullen in je huis?", ["Inboedelverzekering", "Zorgverzekering", "Aansprakelijkheidsverzekering", "Autoverzekering"], 0),
    quick("h4-8", "Hoe noem je de kans dat iets misgaat?", ["Risico", "Loon", "Omzet", "Rente"], 0),
    tf("h4-9", "Een aansprakelijkheidsverzekering kan schade aan anderen dekken.", 0),
    mc("h4-10", "Wat doe je vaak eerst na schade?", ["Schade melden", "Een nieuw product maken", "Belasting betalen", "Je premie stoppen"], 0),
    quick("h4-11", "Welke verzekering heb je nodig voor medische kosten?", ["Zorgverzekering", "Reisverzekering", "Bromfietsverzekering", "Opstalverzekering"], 0),
    tf("h4-12", "Hoe hoger het risico, hoe lager de premie meestal is.", 1)
  ],
  h5: [
    mc("h5-1", "Wat staat vaak in een vacature?", ["Functie en eisen", "De winst van vorig jaar", "De prijs van grondstoffen", "De koers van aandelen"], 0),
    mc("h5-2", "Wat is bruto loon?", ["Loon voor aftrek van belasting", "Loon dat je op je rekening krijgt", "Fooi", "Vakantiegeld alleen"], 0),
    tf("h5-3", "Netto loon is het bedrag dat je meestal ontvangt.", 0),
    tf("h5-4", "Een cv is een soort verzekeringsformulier.", 1),
    mc("h5-5", "Waarom schrijf je een sollicitatiebrief?", ["Om jezelf voor te stellen", "Om belasting aan te geven", "Om een lening te krijgen", "Om premie terug te vragen"], 0),
    quick("h5-6", "Hoe heet een gesprek met een werkgever?", ["Sollicitatiegesprek", "Kasboek", "Veiling", "Incasso"], 0),
    mc("h5-7", "Wat is een bijbaan?", ["Werk naast school", "Een eigen bedrijf", "Een verzekering", "Een lening"], 0),
    quick("h5-8", "Welk document laat zien wat je kunt en hebt gedaan?", ["Cv", "Factuur", "Polis", "Kasbon"], 0),
    tf("h5-9", "Bij een vast contract weet je beter waar je aan toe bent.", 0),
    mc("h5-10", "Wat is vakantiegeld?", ["Extra geld boven op je loon", "Een boete voor te laat komen", "Een soort belasting", "Rente op sparen"], 0),
    quick("h5-11", "Wie betaalt meestal jouw loon?", ["Werkgever", "Verzekeraar", "Bank", "Gemeente"], 0),
    tf("h5-12", "Scholing kan je kansen op werk vergroten.", 0)
  ],
  h6: [
    mc("h6-1", "Wat bedoelen we met productie?", ["Het maken van goederen of diensten", "Het sparen van geld", "Het verzekeren van risico's", "Het betalen van rente"], 0),
    mc("h6-2", "Wat is vraag op een markt?", ["Hoeveel klanten willen kopen", "Hoeveel mensen sparen", "Hoeveel banken er zijn", "Hoeveel premie je betaalt"], 0),
    tf("h6-3", "Als de vraag stijgt, kan de prijs ook stijgen.", 0),
    tf("h6-4", "Aanbod betekent hetzelfde als winst.", 1),
    mc("h6-5", "Wat is aanbod?", ["Hoeveel producten te koop zijn", "Hoeveel leerlingen er meedoen", "Hoeveel belasting je betaalt", "Hoeveel verzekeringen je hebt"], 0),
    quick("h6-6", "Welk woord hoort bij kosten van een bedrijf?", ["Uitgaven", "Rente", "Bonus", "Polis"], 0),
    mc("h6-7", "Waarom verlagen winkels soms hun prijs?", ["Om meer te verkopen", "Om minder klanten te krijgen", "Om rente te verhogen", "Om productie te stoppen"], 0),
    quick("h6-8", "Hoe heet geld dat een bedrijf verdient met verkopen?", ["Omzet", "Premie", "Subsidie", "Lening"], 0),
    tf("h6-9", "Concurrentie betekent dat meerdere bedrijven dezelfde klant willen.", 0),
    mc("h6-10", "Wat gebeurt er vaak bij veel aanbod en weinig vraag?", ["De prijs daalt", "De prijs stijgt altijd", "Er komt meer rente", "De markt stopt direct"], 0),
    quick("h6-11", "Waar ontmoeten vraag en aanbod elkaar?", ["Op de markt", "In een kluis", "In een polis", "In een cv"], 0),
    tf("h6-12", "Reclame kan invloed hebben op de vraag naar een product.", 0)
  ]
};

export function generateQuestionSet(chapterId, count = 12) {
  const chapterQuestions = QUESTION_BANK[chapterId] ?? [];
  return shuffle(chapterQuestions).slice(0, Math.min(count, chapterQuestions.length));
}

function shuffle(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}
