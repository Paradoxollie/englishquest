import type { Activity, AuthoredActivity, RadioMessage } from "./activities";
import type { EchoQuestion, EchoScenario } from "@/lib/games/echoSignal";
import type { RushQuestion } from "@/lib/games/grammar-rush";

const doc = (label: string, text: string) => ({ label, text });
const lesson = (rule: string, example: string) => ({ rule, example });
const radio = (file: string, speaker: RadioMessage["speaker"], line: string): RadioMessage => ({ file, speaker, line });

function scene(mode: Activity["mode"], title: string, prompt: string, detail: Partial<Activity>, accept: string[], hint: string, explain: string): AuthoredActivity {
  return { mode, title, prompt, ...detail, accept, hint, explain };
}

function rush(course: number, topic: string, lines: [string, string, string, string][]): AuthoredActivity {
  const questions: RushQuestion[] = lines.map(([question, right, second, third], i) =>
    ({ id: `atlas-${course}-${i + 1}`, course, question, options: [right, second, third], correctAnswer: 0 }));
  return scene("game", "Grammar Rush", topic, { game: { type: "rush", questions } }, [],
    "Relis les corrections, puis relance les quatre signaux. Trois réponses justes ouvrent le passage.",
    "Au moins trois des quatre signaux ont été décodés.");
}

function echo(message: RadioMessage, title: string, questions: EchoQuestion[]): AuthoredActivity {
  const scenario: EchoScenario = { id: message.file, level: 1, category: "Radio de l’Atlas", title, context: title,
    lines: [{ speaker: message.speaker, voiceProfile: message.speaker === "Maya" ? "female_us" : "male_us", text: message.line }],
    questions: [questions[0], questions[1]] };
  return scene("game", "Echo Signal", "Intercepte la transmission et retrouve ses deux informations.", { englishCue: "Listen.", game: { type: "echo", scenario, radio: message } }, [],
    "Tu peux relancer la transmission et ralentir la voix. Cherche une information à chaque écoute.",
    "Les deux informations de la transmission sont confirmées.");
}

export const scenes: Record<number, AuthoredActivity[]> = {
  1: [
    scene("choice", "Premier contact", "Maya monte à bord et te dit bonjour. Que lui réponds-tu ?", {
      lesson: lesson("Pour dire bonjour, tu peux dire Hello ou Hi. Pour dire au revoir, dis Goodbye.", "Hello! = Bonjour !    Goodbye! = Au revoir !"),
      document: doc("Billet d’équipage · 10:04", "Maya: Hello!"), options: ["Goodbye!", "Hello!"] },
    ["Hello!"], "Tu arrives. Cherche le mot qui ouvre une conversation.", "Hello! Le robot s’allume et attend de connaître son équipage."),
    scene("choice", "Une voix sur le quai", "Écoute qui se présente. Quel badge tends-tu au robot ?", {
      lesson: lesson("I’m et I am veulent dire « je suis ». Devant un prénom, on peut les employer pour se présenter.", "I’m Maya. = Je m’appelle Maya."),
      radio: radio("robot", "Sam", "Hello! I'm Sam. Hi, Maya!"), options: ["Maya", "Sam"] },
    ["Sam"], "Repère le prénom juste après I’m. L’autre prénom est celui de la personne saluée.", "I’m Sam. C’est Sam qui se présente, puis il salue Maya."),
    scene("order", "À toi le micro", "Ton nom de héros est Nova. Assemble « Bonjour, je suis Nova ».", {
      options: ["Nova", "Hello,", "I’m"] }, ["Hello I'm Nova"],
    "Commence par saluer, puis dis I’m, puis ton nom.", "Hello, I’m Nova. Le robot reconnaît ton insigne."),
    rush(1, "La radio reçoit quatre messages très courts. Identifie les salutations et les présentations.", [
      ["Tu arrives sur le quai. Tu dis…", "Hello!", "Goodbye!", "Bye!"], ["« I’m Maya. » Qui parle ?", "Maya", "Sam", "Nova"],
      ["Maya repart. Elle te dit…", "Goodbye!", "Hi!", "Hello!"], ["Pour dire « Je suis Sam », choisis…", "I am Sam.", "I am Maya.", "Hello, Maya!"] ]),
    scene("write", "Signe le registre", "Le robot propose un autre badge, Sky. Présente-toi en anglais avec ce nom de héros.", {
      document: doc("Ton nouveau badge", "SKY") }, ["I'm Sky", "I am Sky", "My name is Sky", "My name's Sky", "It's Sky", "Hello I'm Sky", "Hi I'm Sky", "Hello I am Sky", "Hi I am Sky", "Hello my name is Sky", "Hi my name is Sky"],
    "Tu peux commencer par I’m ou I am, puis ajouter le nom du badge.", "I’m Sky et My name is Sky permettent tous les deux de te présenter. La navette peut partir."),
  ],
  2: [
    scene("choice", "Le sac de Maya", "Maya cherche une clé. Quel mot choisis-tu sur l’inventaire ?", {
      lesson: lesson("Voici trois objets à emporter. A veut dire « un » ou « une ».", "a key = une clé · a bag = un sac · a map = une carte"),
      options: ["a bag", "a map", "a key"] }, ["a key"], "Map sert à trouver son chemin. Bag permet de transporter des affaires.", "A key, c’est une clé. Elle ouvre le boîtier de la balise."),
    scene("choice", "L’abri sous le grand arbre", "Sous un parapluie, Maya trouve deux sacs. Lequel demande-t-elle ?", {
      lesson: lesson("Red signifie rouge et blue signifie bleu. En anglais, la couleur se place avant l’objet.", "a blue key = une clé bleue"),
      document: doc("Le mot de Maya", "Hello! A red bag, please."), options: ["Un sac bleu", "Un sac rouge", "Une clé rouge"] },
    ["Un sac rouge"], "Red indique la couleur. Bag désigne l’objet.", "A red bag est un sac rouge. L’équipe le met à l’abri du passage de la balise."),
    scene("order", "L’étiquette effacée", "Écris avec les étiquettes « C’est une carte bleue ».", {
      lesson: lesson("It’s veut dire « c’est ». Tu peux aussi écrire It is.", "It’s a red key. = C’est une clé rouge."),
      options: ["map", "It’s", "blue", "a"] }, ["It's a blue map"], "Commence par It’s a, puis la couleur, puis l’objet.", "It’s a blue map. Sam retrouve la carte du pont."),
    echo(radio("jungle", "Sam", "Hello, I'm Sam. A blue bag, please. A red key, too. Thank you!"), "La commande de Sam", [
      { id: "bag", prompt: "Quel sac demande Sam ?", options: ["Un sac rouge.", "Un sac bleu.", "Une carte bleue.", "Une clé rouge."], correctIndex: 1, explanation: "A blue bag désigne un sac bleu." },
      { id: "key", prompt: "Et quel deuxième objet ?", options: ["Une clé bleue.", "Un sac rouge.", "Une clé rouge.", "Une carte rouge."], correctIndex: 2, explanation: "A red key désigne une clé rouge." } ]),
    scene("write", "Ta première étiquette", "Écris « une carte rouge » en anglais sur le colis.", {},
    ["a red map", "It's a red map", "It is a red map"], "Pars de a. En anglais la couleur vient avant map.", "A red map. Grâce à ton étiquette, la carte repart dans le bon sac."),
  ],
  3: [
    scene("choice", "Deux trousses de voyage", "Maya écrit dans le carnet. Qu’a-t-elle ?", {
      englishCue: "Read the note.",
      lesson: lesson("I have veut dire « j’ai ». I’ve got permet de dire la même chose.", "I have a bag. = J’ai un sac."),
      document: doc("Le carnet de Maya", "Hello! I’m Maya. I have a blue key."), options: ["Une clé bleue", "Une carte bleue", "Une clé rouge"] },
    ["Une clé bleue"], "Relis ce qui suit I have. Retrouve les mots appris dans la forêt.", "Maya a une clé bleue. Elle la garde pour le mécanisme du moulin."),
    scene("choice", "L’instrument du meunier", "Qui a l’ocarina, le petit instrument du moulin ?", {
      lesson: lesson("Pour parler d’une autre personne, emploie has.", "I have a key. Sam has a map."),
      document: doc("Inventaire du moulin", "Maya has the key. Sam has the blue bag. The ocarina is in Sam’s bag."),
      options: ["Maya", "Sam"] }, ["Sam"], "Le carnet parle de Sam’s bag, le sac de Sam.", "L’ocarina est dans le sac de Sam. Il le remet au meunier."),
    scene("choice", "La caisse des outils", "D’après la radio, qui a la carte rouge ?", {
      englishCue: "Listen and choose.",
      radio: radio("chimes", "Maya", "I'm Maya. I have a blue bag. Sam has a red map."),
      options: ["Maya", "Sam"] }, ["Sam"], "Écoute le prénom juste avant has a red map.", "Sam has a red map. Maya, elle, a le sac bleu."),
    scene("order", "Passe la clé", "Construis « Maya a une clé rouge ».", { options: ["a red key", "Maya", "has"] },
    ["Maya has a red key"], "Le prénom vient avant has, puis tu ajoutes l’objet.", "Maya has a red key. L’étiquette du trousseau est complète."),
    rush(3, "Trie les quatre messages du moulin. Qui possède quel objet ?", [
      ["I ___ a bag.", "have", "has", "am"], ["Sam ___ a map.", "has", "have", "is"],
      ["« I have a red key. » Quel objet ?", "Une clé rouge", "Un sac rouge", "Une carte bleue"], ["« Maya has a bag. » Qui a un sac ?", "Maya", "Sam", "Le robot"] ]),
    scene("write", "Ton inventaire", "Dis en anglais « J’ai une clé bleue ».", {},
    ["I have a blue key", "I've got a blue key", "I have got a blue key"], "Commence par I have ou I’ve got. Ajoute a, la couleur puis l’objet.", "I have a blue key. Ton inventaire permet à Maya d’ouvrir le moulin."),
  ],
  4: [
    scene("choice", "L’escale du sous-marin", "Repère la carte de Sam.", {
      englishCue: "Read and choose.",
      lesson: lesson("In signifie « dans ». On veut dire « sur ».", "in the bag = dans le sac · on the bag = sur le sac"),
      document: doc("Carnet du sous-marin jaune", "Yellow submarine · Lost and found\nSam’s map is in the red bag."),
      options: ["Sur le sac rouge", "Dans le sac rouge", "Sur le ferry"] }, ["Dans le sac rouge"], "L’objet est à l’intérieur si tu lis in.", "The map is in the red bag. Sam remonte avec sa carte."),
    scene("order", "Sous la passerelle", "Construis « La clé est sous le sac ».", {
      lesson: lesson("Under signifie « sous ». The key is… permet de dire où est la clé.", "The map is under the bag. = La carte est sous le sac."),
      options: ["the bag", "under", "The key", "is"] }, ["The key is under the bag"], "Commence par le nom de l’objet que tu cherches.", "The key is under the bag. Maya la ramasse avant que l’eau ne monte."),
    echo(radio("ferry", "Maya", "Hi, it's Maya. The red key is on the bag. The blue map is under the bag."), "La radio de l’écluse", [
      { id: "location-key", prompt: "Où est la clé rouge ?", options: ["Dans le sac.", "Sur le sac.", "Sous le sac.", "Dans l’eau."], correctIndex: 1, explanation: "On the bag signifie « sur le sac »." },
      { id: "location-map", prompt: "Où est la carte bleue ?", options: ["Sous le sac.", "Sur le sac.", "Dans le sac.", "Sur le quai."], correctIndex: 0, explanation: "Under the bag signifie « sous le sac »." } ]),
    scene("choice", "Un mot qui change tout", "Quel message dit que la clé est À L’INTÉRIEUR du sac ?", {
      options: ["The key is on the bag.", "The key is under the bag.", "The key is in the bag."] }, ["The key is in the bag."],
    "Relis les trois prépositions de l’escale.", "In place la clé dans le sac. Sam ferme la poche avant d’embarquer."),
    scene("write", "Guide le ferry", "Envoie à Maya « La carte est sur le sac ».", { englishCue: "Write your message." },
    ["The map is on the bag", "The map's on the bag"], "Pars de The map is. Il reste à indiquer « sur le sac ».", "The map is on the bag. Depuis le bateau, Maya repère la carte et rejoint la rive haute."),
  ],
  5: [
    scene("choice", "Les badges de nuit", "Qui possède la clé du dôme ?", {
      englishCue: "Read the names.",
      document: doc("Registre de l’observatoire", "I’m Maya. I have the map.\nI’m Sam. I have the key."),
      options: ["Maya", "Sam", "Le robot"] }, ["Sam"], "Lis les deux lignes jusqu’au bout. La clé se dit key.", "Sam a la clé. Maya a la carte. Ils se partagent le travail."),
    scene("choice", "Les étoiles du plafond", "Le plan de l’observatoire est-il sur la table ou sous la table ?", {
      lesson: lesson("Deux mots pour cette dernière escale.", "a star = une étoile · a table = une table"),
      document: doc("La salle au ciel peint", "Stars on the ceiling. A blue map under the table."),
      options: ["Sur la table", "Sous la table"] }, ["Sous la table"],
    "Under indique ce qui est en dessous.", "La carte est sous la table. Les étoiles du plafond, elles, sont peintes."),
    scene("choice", "La dernière transmission", "À qui faut-il apporter la clé, et de quelle couleur est-elle ?", {
      englishCue: "Listen and read.",
      document: doc("Étiquettes des destinataires", "Blue key → Maya\nRed key → Sam"),
      radio: radio("stars", "Sam", "Hi, it's Sam. I have two keys. Leave the red key in the bag. Take the blue key."),
      options: ["La clé rouge à Sam", "La clé bleue à Sam", "La clé bleue à Maya"] }, ["La clé bleue à Maya"],
    "La radio indique la clé à prendre. L’étiquette de cette couleur donne le destinataire.", "Take the blue key indique la clé bleue. La fiche Blue key → Maya précise à qui l’apporter."),
    rush(5, "Relie les indices des quatre mondes pour aligner le télescope.", [
      ["« Hi, I’m Sky. » Quel badge ?", "Sky", "Sam", "Maya"], ["« I have a red bag. » Choisis l’objet.", "Un sac rouge", "Une clé rouge", "Un sac bleu"],
      ["« The key is on the map. » Où est la clé ?", "Sur la carte", "Sous la carte", "Dans le sac"], ["Sam ___ the blue key.", "has", "have", "am"] ]),
    scene("order", "La carte des étoiles", "Construis « La clé bleue est sous la carte ».", { englishCue: "Put the words in order.",
      options: ["is", "The blue key", "the map", "under"] }, ["The blue key is under the map"], "Commence par le groupe qui désigne la clé bleue.", "The blue key is under the map. Le télescope vise maintenant la bonne étoile."),
    scene("write", "Ton message aux deux héros", "Ton badge dit Nova. Écris deux phrases en anglais. Présente-toi, puis dis que la clé est sur la carte.", {
      englishCue: "Write two sentences.",
      document: doc("Dernier message", "Badge · NOVA     Objet · la clé     Position · sur la carte") },
    ["I'm Nova. The key is on the map", "I am Nova. The key is on the map", "My name is Nova. The key is on the map", "My name's Nova. The key is on the map", "I'm Nova. The key's on the map", "I am Nova. The key's on the map", "My name is Nova. The key's on the map", "My name's Nova. The key's on the map"],
    "La première phrase peut commencer par I’m ou My name is. La deuxième commence par The key.", "I’m Nova. The key is on the map. Ton équipe a reçu les deux informations. Le faisceau rallume la route des cinq mondes."),
  ],
};

for (const episode of Object.values(scenes)) {
  episode.push(scene("quiz", "Le carnet de bord", "Réponds aux trois questions pour valider ton escale.", {}, [],
    "Vérifie à nouveau tes réponses. Tu peux aussi revoir les indices du décor.",
    "Les trois réponses du carnet sont justes. Cette escale est validée."));
}
