import type { Activity, AuthoredActivity, RadioMessage } from "./activities";
import type { EchoQuestion, EchoScenario } from "@/lib/games/echoSignal";
import type { RushQuestion } from "@/lib/games/grammar-rush";

const doc = (label: string, text: string) => ({ label, text });
type Lesson = NonNullable<Activity["lesson"]>;
const lesson = (rule: string, example: string, parts?: Lesson["parts"], say?: string): Lesson => ({ rule, example, parts, say });
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
    scene("choice", "Premier contact", "Sam part chercher la boussole. Que lui dis-tu en le voyant partir ?", {
      lesson: lesson("Deux mots pour le quai", "Hello! · Bonjour !\nGoodbye! · Au revoir !"), options: ["Hello!", "Goodbye!"], reply: { speaker: "Sam", line: "Goodbye, Nova!" } },
    ["Goodbye!"], "Sam s’éloigne. Cherche le mot du départ.", "Sam te fait un signe de la main. La radio reste entre tes mains."),
    scene("choice", "Une voix sur le quai", "Qui vient de t’appeler ?", {
      lesson: lesson("À la radio, on salue puis on donne son prénom.", "Hi! · Salut !\nI’m Maya. · Je suis Maya."),
      radio: radio("sam-intro", "Sam", "Hi, I’m Sam."), options: ["Maya", "Sam"] },
    ["Sam"], "Écoute le prénom qui vient après I’m.", "C’est Sam. Il a retrouvé le robot qui transporte la boussole."),
    scene("order", "À toi le micro", "Ton nom de héros est Nova. Assemble « Bonjour, je suis Nova ».", {
      lesson: lesson("I am et I’m veulent dire « je suis ».", "I’m Maya. · Je suis Maya.", [
        ["I", "I veut dire « je ». C’est le sujet, la personne qui parle."],
        ["am", "Am veut dire « suis ». C’est le verbe être avec I. À l’oral, I am devient souvent I’m."],
        ["Maya.", "C’est le prénom. Tu peux le remplacer par ton nom de héros."],
      ], "Si tu veux, présente-toi à voix haute avec un prénom de ton choix."),
      options: ["Nova", "Hello,", "I’m"] }, ["Hello I'm Nova"],
    "Commence par saluer, puis dis I’m, puis ton nom.", "Hello, I’m Nova. Le robot reconnaît ton insigne."),
    rush(1, "La radio reçoit quatre messages très courts. Identifie les salutations et les présentations.", [
      ["Tu arrives sur le quai. Tu dis…", "Hello!", "Goodbye!", "Bye!"], ["« I’m Maya. » Qui parle ?", "Maya", "Sam", "Nova"],
      ["Maya repart. Elle te dit…", "Goodbye!", "Hi!", "Hello!"], ["Pour dire « Je suis Sam », choisis…", "I am Sam.", "I am Maya.", "Hello, Maya!"] ]),
    scene("write", "Signe le registre", "La dernière passagère porte le badge Sky. Prends sa place au micro et présente-toi en anglais.", {
      document: doc("Le badge de la passagère", "SKY") }, ["I'm Sky", "I am Sky", "My name is Sky", "My name's Sky", "It's Sky", "Hello I'm Sky", "Hi I'm Sky", "Hello I am Sky", "Hi I am Sky", "Hello my name is Sky", "Hi my name is Sky"],
    "Tu peux commencer par I’m ou I am, puis ajouter le nom du badge.", "I’m Sky et My name is Sky permettent tous les deux de te présenter. La navette peut partir."),
  ],
  2: [
    scene("spot", "Le sac de Maya", "Maya te demande « a key ». Touche l’objet à lui tendre.", {
      lesson: lesson("A veut dire « un » ou « une » devant ces objets.", "a key · une clé\na bag · un sac\na map · une carte"),
      spots: { picture: "inventory", points: [[17, 62], [50, 60], [82, 57]], labels: ["Le sac", "La carte", "La clé"] }, options: ["a bag", "a map", "a key"] }, ["a key"], "Map sert à trouver son chemin. Bag permet de transporter des affaires.", "A key, c’est une clé. Elle ouvre le boîtier de la balise."),
    scene("spot", "L’abri sous le grand arbre", "Lis le mot de Maya et touche le sac qu’elle demande.", {
      lesson: lesson("En anglais, la couleur vient avant l’objet.", "a red key · une clé rouge\na blue key · une clé bleue"),
      document: doc("Le mot de Maya", "Hello! A red bag, please."), spots: { picture: "shelter", points: [[29, 58], [73, 57]] }, options: ["Un sac rouge", "Un sac bleu"] },
    ["Un sac rouge"], "Red indique la couleur. Bag désigne l’objet.", "A red bag est un sac rouge. L’équipe le met à l’abri du passage de la balise."),
    scene("order", "L’étiquette effacée", "Écris avec les étiquettes « C’est une carte bleue ».", {
      lesson: lesson("It’s est la forme courte de It is, « c’est ».", "It’s a red key. · C’est une clé rouge.", [
        ["It", "It désigne ici l’objet que tu montres."], ["is", "Avec it, le verbe être s’écrit is."],
        ["a red key.", "Une clé rouge. La couleur red vient avant le nom key."],
      ]),
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
      lesson: lesson("Avec I, on dit have. Avec un prénom comme Sam ou Maya, on dit has.", "I have a key. · J’ai une clé.\nSam has a map. · Sam a une carte.", [
        ["Sam", "Le sujet est Sam. On parle de lui."], ["has", "Has est une forme du verbe avoir."], ["a map.", "C’est l’objet que Sam possède, une carte."],
      ]),
      document: doc("Inventaire du moulin", "I’m Maya. I have a red key. Sam has the ocarina."),
      options: ["Maya", "Sam"] }, ["Sam"], "Cherche le prénom placé juste avant has the ocarina.", "Sam sort l’ocarina. Aux trois premières notes, les voiles rouges frémissent."),
    scene("choice", "Le billet de l’atelier", "Le meunier cherche sa carte rouge. Lis le billet en anglais. Vers qui l’envoies-tu ?", {
      englishCue: "Read the note.",
      document: doc("Le billet près de l’ocarina", "I have the red map. Maya has the blue bag.\nSam"),
      options: ["Maya", "Sam"] }, ["Sam"], "I désigne la personne qui a signé le billet.", "Tu envoies le meunier vers Sam, l’auteur du billet. Carte en main, il peut orienter les voiles."),
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
      lesson: lesson("The désigne un objet précis. In et on indiquent où il se trouve.", "in the bag · dans le sac\non the bag · sur le sac"),
      document: doc("Message du sous-marin jaune", "Hi, Sam! I have a red bag. The map is in the bag."),
      options: ["Sur le sac rouge", "Dans le sac rouge", "Sur le ferry"] }, ["Dans le sac rouge"], "L’objet est à l’intérieur si tu lis in.", "The map is in the red bag. Sam remonte avec sa carte."),
    scene("order", "Sous la passerelle", "Construis « La clé est sous le sac ».", {
      lesson: lesson("Under indique que quelque chose est en dessous.", "The map is under the bag. · La carte est sous le sac.", [
        ["The map", "La carte est le sujet, l’objet dont on parle."], ["is", "Is est le verbe être. Ici, il veut dire « est »."],
        ["under the bag.", "Sous le sac. Ce groupe indique le lieu."],
      ]),
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
      lesson: lesson("Un rendez-vous à l’observatoire", "The door is closed. · La porte est fermée.\nMeet me at the door! · Retrouve-moi à la porte !"),
      document: doc("Un billet glissé sous la porte", "Hi, Nova! I have the map, but the door is closed. Sam has the key. Meet me at the door!\nMaya"),
      options: ["Maya", "Sam", "Le robot"] }, ["Sam"], "Lis les deux lignes jusqu’au bout. La clé se dit key.", "Sam a la clé. Maya a la carte. Ils se partagent le travail."),
    scene("choice", "Les étoiles du plafond", "Le plan de l’observatoire est-il sur la table ou sous la table ?", {
      lesson: lesson("Trois mots pour lire le billet", "a star · une étoile\nthe ceiling · le plafond\na table · une table"),
      document: doc("Le billet de la gardienne", "Hi, Nova! The stars are on the ceiling. My blue map is under the table. It’s for you!"),
      options: ["Sur la table", "Sous la table"] }, ["Sous la table"],
    "Under indique ce qui est en dessous.", "La carte est sous la table. Les étoiles du plafond, elles, sont peintes."),
    scene("choice", "La dernière transmission", "À qui faut-il apporter la clé, et de quelle couleur est-elle ?", {
      englishCue: "Listen and read.",
      lesson: lesson("Deux consignes pour choisir un objet", "Take the map. · Prends la carte.\nLeave the bag. · Laisse le sac."),
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
  6: [
    scene("spot", "Deux noms au générique", "Touche l’artiste qui chante sur la pellicule.", {
      lesson: lesson("Un métier après a", "a singer · un chanteur, une chanteuse\na pilot · un pilote, une pilote"),
      document: doc("Les badges des artistes", "MIRA · singer\nLEO · pilot"), spots: { picture: "film", points: [[28, 53], [63, 51]] }, options: ["Mira", "Leo"] },
    ["Mira"], "Cherche singer sur les badges.", "Mira chante. Son nom se lit encore sur le bord de la pellicule."),
    scene("choice", "Une voix derrière la caméra", "De qui parle Leo dans la deuxième phrase ?", {
      lesson: lesson("I désigne la personne qui parle. She et he permettent de parler d’une autre personne.", "I am Sam. · Je suis Sam.\nShe is Maya. · Elle, c’est Maya.\nHe is Sam. · Lui, c’est Sam."),
      document: doc("La note de Leo", "I am Leo. She is Mira."), options: ["Leo", "Mira", "Sam"] },
    ["Mira"], "Lis le prénom juste après She is.", "Leo se présente, puis désigne Mira, de l’autre côté de la caméra."),
    scene("order", "La fiche de Leo", "Présente Leo avec les étiquettes. Dis « Il est pilote ».", {
      englishCue: "Put the words in order.", lesson: lesson("Pour présenter le métier d’une personne", "She is a singer. · Elle est chanteuse.", [
        ["She", "She est le sujet. Pour Leo, dont la fiche emploie he, tu utiliseras he."],
        ["is", "Avec she et he, le verbe être prend la forme is."], ["a singer.", "En anglais, on garde a devant le métier au singulier."] ]),
      options: ["a pilot", "is", "He"] }, ["He is a pilot"], "Commence par He, puis place le verbe.", "He is a pilot. La fiche de Leo rejoint le premier photogramme."),
    rush(6, "Les sous-titres se sont décrochés. Rends à chaque image sa réplique.", [
      ["Mira se présente. « I ___ Mira. »", "am", "is", "has"], ["Leo est pilote. « He ___ a pilot. »", "is", "am", "have"],
      ["Mira chante. Que dit Sam à son sujet ?", "She is a singer.", "I am a singer.", "He is a pilot."],
      ["Qui parle dans « I am a pilot. » si Mira chante et Leo pilote ?", "Leo", "Mira", "Le projecteur"] ]),
    scene("write", "La fiche de Mira", "Mira monte sur scène. Écris « Elle est chanteuse » pour légender son image.", { englishCue: "Write the caption." },
    ["She is a singer", "She's a singer"], "Utilise She pour Mira, le verbe être, puis le métier avec a.", "She is a singer. Sous cette légende, Sam repère la première image du courrier."),
  ],
  7: [
    scene("choice", "Au guichet", "Tu veux savoir si la personne devant toi est la pilote. Quelle question poses-tu ?", {
      lesson: lesson("Pour transformer une affirmation en question, are passe devant you.", "You are the singer. · Tu es la chanteuse.\nAre you the singer? · Es-tu la chanteuse ?",
        [["Are", "Le verbe être vient en premier dans cette question."], ["you", "You veut dire « tu » ou « vous »."], ["the singer?", "The désigne la personne précise que tu recherches."]]),
      options: ["Are you the pilot?", "You are the singer.", "I am the pilot."] },
    ["Are you the pilot?"], "Commence par le verbe are, puis la personne à qui tu parles.", "Are you the pilot? La guichetière appelle les deux personnes qui partent ce matin."),
    scene("delivery", "Deux réponses", "Prends le bon de vol et confie-le à la personne qui pilote.", {
      lesson: lesson("Répondre pour soi", "Yes, I am. · Oui.\nNo, I’m not. · Non."),
      document: doc("Question aux deux coursiers", "Are you the pilot?\nJo: No, I’m not.\nKit: Yes, I am."), options: ["Le bon de vol", "La bobine"], delivery: { picture: "letter", destinations: ["Jo", "Kit"] } },
    ["Le bon de vol | Kit"], "Sélectionne le bon de vol. Cherche ensuite la personne qui répond oui.", "Kit emporte le bon de vol. Jo reste au guichet pour trier le courrier."),
    scene("order", "Le badge retourné", "Tu cherches maintenant la personne qui chante. Assemble ta question.", {
      englishCue: "Ask a question.", options: ["the singer?", "you", "Are"] },
    ["Are you the singer"], "Reprends l’ordre de la question posée à la pilote, puis change le métier.", "Are you the singer? Mira retourne son badge et te salue."),
    scene("choice", "Le message du haut", "D’après Jo, qui pilote le planeur ?", {
      englishCue: "Read the reply.", document: doc("Un billet tombé du planeur", "Hi, Kit! I am Jo. I’m not the pilot. You are the pilot!"),
      options: ["Kit", "Jo", "Mira"] }, ["Kit"], "Jo parle à Kit. Dans la dernière phrase, you désigne la personne qui reçoit le billet.", "Kit est bien la pilote. Jo lui a gardé la sacoche rouge."),
    scene("write", "Une réponse de ta main", "Tu es Nova, qui transporte les sacs à pied. Kit te demande « Are you the pilot? ». Réponds brièvement en anglais avec le verbe être.", {},
    ["No I'm not", "No I am not", "I'm not", "I am not", "No I'm not the pilot", "No I am not the pilot"], "Commence par No, puis parle de toi avec I.", "No, I’m not. Kit prend les commandes et te confie l’enveloppe à ouvrir."),
  ],
  8: [
    scene("choice", "Les paniers du marché", "Le bon porte le mot four. Combien de places faut-il dans le panier ?", {
      lesson: lesson("Compter jusqu’à cinq", "one · un\ntwo · deux\nthree · trois\nfour · quatre\nfive · cinq"),
      options: ["2", "4", "5"] }, ["4"], "Repars de one et compte jusqu’à four.", "Quatre places. Le panier est assez grand pour la commande de l’île."),
    scene("order", "La marchande lève sa craie", "Demande « Combien de lanternes ? » avec les étiquettes.", {
      lesson: lesson("On demande une quantité avec How many suivi du nom au pluriel.", "one lantern · une lanterne\ntwo lanterns · deux lanternes\nHow many keys? · Combien de clés ?",
        [["How many", "Ces deux mots ensemble veulent dire « combien de »."], ["keys?", "On met le nom au pluriel. Key devient keys, lantern devient lanterns."]]),
      options: ["lanterns?", "How", "many"] }, ["How many lanterns"], "Commence par les deux mots de la question, puis nomme ce que tu comptes.", "How many lanterns? La marchande passe sa radio au canal de l’île."),
    scene("choice", "La quantité à la radio", "Écoute la réponse de l’île. Combien de lanternes sont commandées ?", {
      englishCue: "Listen for the number.", radio: radio("three-us", "Maya", "Three."), options: ["2", "3", "5"] },
    ["3"], "Repère le nombre entre two et four. Tu peux réécouter ou lire le message avec « Sans son ».", "Trois lanternes. Sam déplie l’autre moitié du bon pour retrouver leur couleur."),
    scene("choice", "La moitié du bon", "Lesquelles charges-tu dans le panier ?", {
      englishCue: "Read the order.", document: doc("Le bon plié", "Three blue lanterns. Two red keys."),
      options: ["Trois lanternes bleues", "Deux lanternes rouges", "Trois clés bleues"] },
    ["Trois lanternes bleues"], "Lis le groupe qui se termine par lanterns.", "Le panier bleu est prêt. Les deux clés rouges appartiennent à une autre commande."),
    scene("write", "Un reçu pour le port", "Pour le voyage retour, écris « deux lanternes rouges » en toutes lettres.", { englishCue: "Write the order." },
    ["two red lanterns"], "Commence par le nombre en lettres, puis la couleur, puis le nom au pluriel.", "Two red lanterns. Ce reçu permettra de retrouver le rail dans l’autre sens."),
    scene("delivery", "Le dernier départ", "Prépare le colis pour le port, puis choisis sa destination.", {
      legacyQuiz: true, document: doc("Les commandes", "Port · Two red lanterns.\nIsland · Three blue lanterns."),
      options: ["Three blue lanterns", "Two red lanterns"], delivery: { picture: "lanterns", destinations: ["Île", "Port"] } },
    ["Two red lanterns | Port"], "Relis la ligne Port. Compare la quantité et la couleur avant de fermer le colis.", "Les deux lanternes rouges prennent la route du port. Les trois bleues restent avec vous pour l’île."),
  ],
  9: [
    scene("choice", "Le panneau de la gare", "Le panneau indique Turn right. Quel aiguillage faut-il préparer ?", {
      lesson: lesson("Deux directions", "Turn left. · Tourne à gauche.\nTurn right. · Tourne à droite."), options: ["À gauche", "À droite"] },
    ["À droite"], "Right correspond à la droite.", "Sam déverrouille l’aiguillage de droite. Le wagon peut quitter le quai."),
    scene("choice", "Le signal fixe", "Que dois-tu faire au deuxième signal ?", {
      lesson: lesson("Sur une voie toute droite", "Go straight. · Va tout droit.\nStop. · Arrête-toi.\nThen · ensuite"),
      document: doc("Les deux signaux", "Go straight. Then stop."), options: ["Aller tout droit", "M’arrêter", "Tourner à gauche"] },
    ["M’arrêter"], "Then annonce l’action suivante.", "Le wagon s’arrête devant le premier poste d’aiguillage."),
    scene("route", "Aux commandes du rail", "Conduis le wagon. À chaque croisement, suis le billet.", {
      englishCue: "Follow the route.", document: doc("La feuille de route", "Turn left. Then turn right.") },
    ["left right"], "Le premier virage est à gauche. Pour le deuxième, relis les mots après then.", "Gauche puis droite. La lanterne du tunnel s’allume au passage du wagon."),
    scene("order", "Un rail tout droit", "Compose « Va tout droit, puis arrête-toi ».", {
      englishCue: "Guide the driver.", options: ["stop.", "Go", "then", "straight,"] }, ["Go straight then stop"], "Commence par Go straight, puis relie les actions avec then.", "Go straight, then stop. Le wagon attend à l’entrée du dernier tunnel."),
    scene("write", "Le virage de sortie", "Sam conduit. Écris-lui « Tourne à gauche » en anglais.", {}, ["Turn left", "Turn to the left", "Take a left", "Make a left turn"],
    "Commence par le verbe de la consigne, puis indique la direction.", "Turn left. En sortant du tunnel, Sam aperçoit le premier tuyau du phare."),
  ],
  10: [
    scene("choice", "Un message à plusieurs", "Qui se dit prêt à partir ?", {
      lesson: lesson("Quand on parle au nom du groupe, on utilise we.", "I am ready. · Je suis prêt ou prête.\nWe are ready. · Nous sommes prêts.\nWe’re ready. · C’est la même phrase, en plus court."),
      document: doc("Signatures au bas du billet", "We are ready!\nMira and Leo"), options: ["Mira seule", "Mira et Leo", "Leo seul"] },
    ["Mira et Leo"], "We inclut les deux personnes qui signent.", "Mira et Leo attendent ensemble au phare. Ils gardent une place pour votre courrier."),
    scene("choice", "La consigne de Mira", "De quoi le phare a-t-il encore besoin ?", {
      englishCue: "Read the note.", lesson: lesson("Pour demander des objets", "We need a map. · Nous avons besoin d’une carte.\nWe have a map. · Nous avons une carte."),
      document: doc("La lettre de l’île", "We have two red lanterns. We need three blue lanterns.\nMira and Leo"),
      options: ["Deux lanternes rouges", "Trois lanternes bleues", "Trois clés bleues"] }, ["Trois lanternes bleues"], "Lis ce qui suit We need.", "Le panier du marché contient exactement les lanternes qui manquaient."),
    scene("route", "La voie du retour", "Guide la barque aux deux embranchements du chenal.", {
      englishCue: "Follow the route.", document: doc("Les marques sur la carte", "Turn right. Then turn left.") },
    ["right left"], "Right d’abord, left après then. Tu peux annuler le dernier virage.", "La barque rejoint la jetée. Le port peut maintenant recevoir votre réponse."),
    rush(10, "Les fenêtres du phare s’éclairent. Lis les quatre signaux avant d’envoyer ton message.", [
      ["« Are you the pilot? » Tu l’es. Réponds.", "Yes, I am.", "Yes, he is.", "No, I’m not."],
      ["« She is a singer. » Qui est sur scène d’après le film ?", "Mira", "Leo", "Sam"],
      ["« We need two keys. » Que faut-il apporter ?", "Deux clés", "Trois clés", "Deux cartes"],
      ["« Turn left. Then stop. » Que fais-tu à la fin ?", "Je m’arrête", "Je tourne à droite", "Je vais tout droit"] ]),
    scene("write", "La réponse de l’équipe", "Écris deux phrases pour la poste. Dis « Nous sommes prêts. Nous avons deux cartes ».", {
      englishCue: "Write for your team." }, ["We are ready. We have two maps", "We're ready. We have two maps", "We are ready. We've got two maps", "We're ready. We've got two maps", "We are ready. We have got two maps", "We're ready. We have got two maps"],
    "Commence tes deux phrases par We. Dans la deuxième, réutilise have et mets map au pluriel après two.", "We’re ready. We have two maps. Vous gardez une carte sur l’île et confiez l’autre au port."),
  ],
  11: [
    scene("spot", "Un mot au vestiaire", "Iris a laissé un billet. Touche ce qu’elle est venue chercher.", {
      lesson: lesson("My indique à qui appartient l’objet. C’est la personne qui parle.", "my key · ma clé\nmy map · ma carte\nmy bag · mon sac"),
      document: doc("Le billet d’Iris", "My bag, please!\nIris"), options: ["Le sac", "La carte", "La clé"],
      spots: { picture: "cloakroom", points: [[18, 60], [50, 63], [80, 55]] } },
    ["Le sac"], "Iris dit my bag. Quel objet sert à emporter ses affaires ?", "Tu sors le sac bleu du vestiaire. Dans la doublure dépasse un ticket."),
    scene("choice", "Les deux faces du ticket", "Iris parle à Sam. À qui appartient la carte ?", {
      lesson: lesson("Your désigne ce qui appartient à la personne à qui on parle.", "my bag · mon sac\nyour bag · ton sac, votre sac"),
      document: doc("Au dos du ticket", "Sam, this is your map.\nIris"), options: ["À Iris", "À Sam", "À Maya"] },
    ["À Sam"], "Iris a écrit le prénom de la personne à qui elle parle.", "Sam reconnaît son plan du port. Iris s’en est servie pour entrer dans le musée."),
    scene("choice", "L’appel du propriétaire", "Écoute qui appelle, puis retrouve le ticket de cette personne.", {
      englishCue: "Listen and match.", radio: radio("sam-intro", "Sam", "Hi, I’m Sam."),
      document: doc("Les deux tickets", "Maya · my key\nSam · my map"), options: ["Le ticket de la clé", "Le ticket de la carte"] },
    ["Le ticket de la carte"], "Retrouve le prénom entendu, puis lis l’objet écrit à côté.", "Sam récupère le ticket de son plan. Celui de la clé reste à Maya."),
    scene("order", "Rendre la carte", "Parle à Sam. Assemble « C’est ta carte » en commençant par This.", {
      lesson: lesson("Quand tu rends un objet, tu peux le montrer avec This is.", "This is my key. · C’est ma clé.\nThis is your bag. · C’est ton sac."),
      options: ["your", "map.", "This", "is"] }, ["This is your map"], "Commence par This is. À qui parles-tu ?", "This is your map. Sam retourne la carte et découvre un dessin du vestiaire."),
    scene("write", "La voix dans le cadre", "Iris écrit à la première personne. Écris pour elle « C’est mon sac ».", { englishCue: "Write as Iris." },
    ["This is my bag", "It's my bag", "It is my bag", "That's my bag", "That is my bag", "This bag is mine", "That bag is mine"], "C’est Iris qui parle. Emploie my devant l’objet.", "This is my bag. Le cadre renvoie les mots d’Iris comme un écho."),
  ],
  12: [
    scene("spot", "La propriétaire de l’écharpe", "Lis la fiche, puis touche le portrait de la personne à qui appartient l’écharpe bleue.", {
      lesson: lesson("His et her renvoient au propriétaire. Ici, Iris est désignée par she et Noé par he.", "her scarf · son écharpe à elle\nhis scarf · son écharpe à lui\na scarf · une écharpe"),
      document: doc("Le registre", "Iris is here. Her scarf is blue.\nNoé is here. His scarf is red."),
      options: ["Iris", "Noé"], spots: { picture: "mirrors", points: [[27, 55], [66, 49]] }, englishCue: "Find the owner." },
    ["Iris"], "Cherche la propriétaire de l’écharpe bleue, celle désignée par her.", "L’écharpe bleue appartient à Iris. Une petite clé brille dans son reflet."),
    scene("choice", "Le gardien reconnaît sa clé", "Maya parle de Noé et de la clé qui lui appartient. Comment finit-elle sa phrase ?", {
      document: doc("La légende à compléter", "This is Noé. This is ___ key."), options: ["his", "her", "my"] },
    ["his"], "Le registre désigne Noé par he. Quel petit mot va avec he pour parler de sa clé ?", "This is his key. La clé du gardien a enfin retrouvé son étiquette."),
    scene("evidence", "Le tiroir aux tickets", "Épingle les deux indices qui relient une personne à la clé rouge, puis nomme cette personne.", {
      clues: [doc("L’inventaire", "The red key is in the blue bag."), doc("Le ticket d’Iris", "The blue bag is my bag. — Iris"), doc("L’écharpe de Noé", "My scarf is red. — Noé")],
      options: ["Iris", "Noé"] }, ["0+1 | Iris"], "Une pièce situe la clé. Une autre donne le nom de la propriétaire du sac.", "La clé rouge est dans le sac bleu d’Iris. La couleur de l’écharpe ne dit rien sur la clé."),
    scene("order", "Sous le reflet", "La clé rouge est celle d’Iris. Écris « C’est sa clé » avec les étiquettes.", {
      englishCue: "Label the key.", options: ["her", "This", "key.", "is"] }, ["This is her key"], "Commence par This is. Pour Iris, le registre emploie she.", "This is her key. Le reflet d’Iris apparaît au-dessus de la clé rouge."),
    scene("write", "Le billet du gardien", "Présente le sac de Noé. Écris « C’est son sac » en précisant en anglais qu’il est à lui.", { englishCue: "Write the label." },
    ["This is his bag", "It's his bag", "It is his bag", "That's his bag", "That is his bag"], "C’est Noé qui possède le sac. Tu parles de lui.", "This is his bag. Sam glisse l’étiquette dans la pochette du registre."),
    scene("delivery", "Remise en main propre", "Rends au gardien sa clé. Choisis l’objet, puis la personne qui doit le recevoir.", {
      document: doc("La dernière ligne du registre", "Iris · her red key\nNoé · his blue key"),
      options: ["The red key", "The blue key"], delivery: { picture: "mirrors", destinations: ["Iris", "Noé"] } },
    ["The blue key | Noé"], "Le gardien s’appelle Noé. Relis sa ligne pour choisir la couleur.", "Noé reçoit sa clé bleue. Le tiroir s’ouvre sur une plume de cuivre."),
  ],
  13: [
    scene("spot", "Le premier déclic", "Lis la commande en anglais et touche l’automate à réveiller.", {
      lesson: lesson("Deux automates veillent dans l’atelier.", "a heron · un héron\na turtle · une tortue\nwake up · réveille-toi"),
      document: doc("La commande", "Wake up, turtle!"), options: ["Le héron", "La tortue"], spots: { picture: "automata", points: [[26, 48], [74, 59]] } },
    ["La tortue"], "Turtle désigne l’animal à carapace.", "La tortue se réveille. Un petit cliquetis sort du tiroir de son harnais."),
    scene("choice", "Le bagage trop lourd", "Que sait faire la tortue d’après sa fiche ?", {
      lesson: lesson("Can veut dire « pouvoir » ou « savoir faire ». Le verbe qui suit garde sa forme.", "I can open the door. · Je peux ouvrir la porte.\nI can carry a bag. · Je peux porter un sac."),
      document: doc("La fiche de la tortue", "I can carry the bag."), options: ["Porter le sac", "Ouvrir la porte", "Dessiner la carte"] },
    ["Porter le sac"], "Cherche le verbe après can.", "La carapace a juste la place pour le sac bleu."),
    scene("choice", "Le ressort bloqué", "Quelle action le héron ne peut-il pas faire ?", {
      lesson: lesson("Can’t est la forme courte de cannot.", "I can open the door. · Je peux ouvrir la porte.\nI can’t open the door. · Je ne peux pas ouvrir la porte."),
      document: doc("La fiche du héron", "I can open the door. I can't carry the bag."), options: ["Porter le sac", "Ouvrir la porte"] },
    ["Porter le sac"], "Dans la deuxième phrase, cherche ce qui suit can’t.", "Son bec peut tourner la clé, mais le sac déséquilibrerait ses longues pattes."),
    scene("delivery", "Chacun son outil", "Prépare ce qu’il faut pour ouvrir la porte. Donne-le au bon automate.", {
      document: doc("La consigne de Noé", "The heron can open the door. The turtle can carry the bag."),
      options: ["The bag", "The key"], delivery: { picture: "automata", destinations: ["The turtle", "The heron"] } },
    ["The key | The heron"], "Pour ouvrir la porte, il faut une clé. Relis la première phrase pour trouver qui la reçoit.", "La clé s’emboîte dans le bec du héron."),
    scene("write", "Une voix de métal", "Parle comme la tortue. Écris « Je peux porter le sac ».", { englishCue: "Speak for the turtle." },
    ["I can carry the bag"], "Commence par I can, puis utilise le verbe qui signifie porter.", "I can carry the bag. Le harnais de la tortue se tend."),
    scene("evidence", "Le laissez-passer", "Une seule machine peut-elle porter le sac et ouvrir la porte ? Épingle les deux fiches utiles et réponds à Noé.", {
      clues: [doc("Héron", "I can open the door. I can't carry the bag."), doc("Plan de la porte", "The key is on the table."), doc("Tortue", "I can carry the bag. I can't open the door.")],
      options: ["Le héron seul", "La tortue seule", "Il faut les deux"] },
    ["0+2 | Il faut les deux"], "Compare ce que chaque automate peut faire et ce qui lui est impossible.", "Il faut les deux. Le héron ouvre la porte pendant que la tortue passe avec le sac."),
  ],
  14: [
    scene("choice", "Une étoile manque à l’appel", "Noé cherche une seule clé. Quelle question doit-il poser ?", {
      lesson: lesson("Pour demander où est un objet, on dit Where is…? Avec plusieurs, on dit Where are…?", "Where is the star? · Où est l’étoile ?\nWhere are the stars? · Où sont les étoiles ?"),
      options: ["Where are the keys?", "Where is the key?", "Where is the bag?"] },
    ["Where is the key?"], "Noé cherche une clé. Utilise is puis le nom au singulier.", "Where is the key? Une petite tache rouge attire l’œil sous la table."),
    scene("spot", "La serre à la loupe", "Où est la clé ? Touche-la à l’endroit indiqué par le gardien.", {
      lesson: lesson("Situer un objet", "on the map · sur la carte\nunder the table · sous la table"),
      document: doc("Le mot de Noé", "The stars are on the map. The key is under the table."),
      options: ["Les étoiles sur la carte", "La clé sous la table"], spots: { picture: "roof", points: [[48, 39], [48, 85]], labels: ["Sur la carte", "Sous la table"] } },
    ["La clé sous la table"], "Cherche sous le plateau de la table.", "La clé rouge est à portée de la tortue. Il manque encore les deux poids."),
    scene("order", "Le message du toit", "Demande où sont les étoiles.", { englishCue: "Ask where.", options: ["stars?", "are", "the", "Where"] },
    ["Where are the stars"], "Il y a deux étoiles. Commence par Where, puis le verbe au pluriel.", "Where are the stars? Maya répond en tapotant le papier bleu."),
    scene("choice", "Le plan de la balance", "À quel endroit Maya a-t-elle retrouvé les deux poids ?", {
      englishCue: "Read the reply.", document: doc("La réponse de Maya", "The stars are on the map. The map is on the table."),
      options: ["Sur la carte", "Sous la table", "Dans le sac"] }, ["Sur la carte"], "La première phrase situe précisément les étoiles.", "Sur la carte, deux marques rondes montrent où poser les pieds de la balance."),
    scene("write", "La position exacte", "Transmets en anglais « Les étoiles sont sur la carte ».", { englishCue: "Send their location." },
    ["The stars are on the map", "The two stars are on the map", "Both stars are on the map", "The stars are on top of the map"], "Commence par The stars. Accord au pluriel, puis on pour « sur ».", "The stars are on the map. Noé peut installer sa balance."),
  ],
  15: [
    scene("evidence", "Suivre la voyageuse", "Deux documents permettent de retrouver la propriétaire du sac posé près de la toile. Épingle-les et donne son nom.", {
      clues: [doc("Table de restauration", "The bag by the painting is blue."), doc("Poche du gardien", "My key is red. — Noé"), doc("Registre du matin", "Iris has the blue bag. Noé has the red bag.")],
      lesson: lesson("Deux expressions pour lire les documents du musée", "by the painting · près du tableau\nby the door · près de la porte"),
      options: ["Noé", "Iris"] }, ["0+2 | Iris"], "Une pièce situe le sac et donne sa couleur. L’autre relie cette couleur à un nom.", "La tache bleue près de la toile appartient à Iris. Tu reconnais son fameux bagage."),
    scene("delivery", "Rendre le bagage", "Lis la demande. Pose le bon objet devant son destinataire.", {
      englishCue: "Deliver the parcel.", document: doc("Le dernier billet", "This is my blue bag. My map is in the bag. — Iris"),
      options: ["The red key", "The blue bag"], delivery: { picture: "frame", destinations: ["Noé", "Iris"] } },
    ["The blue bag | Iris"], "Iris réclame le bagage qui contient sa carte.", "Iris attrape la poignée. Le bleu de son sac reprend sa place dans le tableau."),
    scene("order", "La voix derrière la toile", "Iris demande « Où est la clé ? ». Recompose sa question.", {
      englishCue: "Ask as Iris.", options: ["the", "Where", "key?", "is"] }, ["Where is the key"], "Il y a une seule clé. Place le verbe juste après Where.", "Where is the key? Un cliquetis répond de l’autre côté du cadre."),
    scene("choice", "La réponse du gardien", "À qui Noé confie-t-il le soin d’ouvrir la porte ?", {
      document: doc("Le billet de Noé", "Iris, your key is on the map. You can open the door. — Noé"),
      options: ["À Iris", "Au héron", "À Sam"] }, ["À Iris"], "Cherche à qui Noé dit you au début du billet.", "Iris retrouve sa clé sur la carte et la tourne dans le cadre comme dans une serrure."),
    scene("choice", "De quel côté du cadre ?", "Maya parle à Iris. Quel message lui rappelle que le sac est bien à elle ?", {
      englishCue: "Choose Maya’s line.", options: ["This is my bag.", "This is your bag.", "This is his bag."] },
    ["This is your bag."], "Maya s’adresse directement à la propriétaire. C’est donc le petit mot qui correspond à « ton ».", "This is your bag. Iris lève les yeux et reconnaît le port sur la toile."),
    scene("write", "Le mot laissé à Noé", "Écris deux phrases en anglais au nom d’Iris pour dire « C’est mon sac. Je peux ouvrir la porte ».", { englishCue: "Leave a note for Noé." },
    ["This is my bag", "It is my bag", "It's my bag", "That is my bag", "That's my bag", "This bag is mine", "That bag is mine"].flatMap(ownBag =>
      [`${ownBag}. I can open the door`, `I can open the door. ${ownBag}`]),
    "Parle pour Iris. Utilise my pour son sac, puis I can et le verbe « ouvrir » pour la porte.", "Noé lit ton mot. Dans le cadre, le bateau d’Iris quitte doucement le quai."),
  ],
  16: [
    scene("spot", "La voix du carnet", "Écoute le nom du fruit, puis touche-le dans le carnet.", {
      lesson: lesson("Deux fruits du verger", "an apple · une pomme\na pear · une poire\napples / pears · des pommes / des poires"),
      radio: { speaker: "Maya", file: "apple", collection: "spell-strike", line: "Apple." },
      options: ["The apple", "The pear"], spots: { picture: "fruit", points: [[29, 51], [73, 52]], labels: ["Fruit de gauche", "Fruit de droite"] } },
    ["The apple"], "Réécoute le mot ou affiche-le avec « Sans son ». Apple désigne la pomme et pear, la poire.", "La pomme rejoint la page des fruits. À côté, Pip a laissé une trace dans la chair d’une poire."),
    scene("choice", "Deux voix au verger", "Sam et Maya goûtent les fruits. Quel fruit Sam dit-il aimer ?", {
      lesson: lesson("Dire ce que l’on aime", "I like pears. · J’aime les poires.\nI like apples. · J’aime les pommes.", [["I", "Je. C’est la personne qui parle."], ["like", "Aimer. Avec I, le verbe garde sa forme de base."], ["pears", "Les poires en général. Le nom comptable est ici au pluriel."]]),
      document: doc("Le carnet de dégustation", "Maya: I like pears.\nSam: I like apples."), options: ["Apples", "Pears"] },
    ["Apples"], "Cherche la ligne de Sam. Le nom du fruit vient après I like.", "Sam glisse une pomme dans sa poche. Maya laisse sa poire près de la petite empreinte."),
    scene("order", "D’une personne à l’autre", "Dis à Maya « Tu aimes les poires ». Assemble les mots.", {
      englishCue: "Talk to Maya.", lesson: lesson("Quand tu t’adresses à quelqu’un, I devient you.", "I like apples. · J’aime les pommes.\nYou like apples. · Tu aimes les pommes."),
      options: ["pears.", "You", "like"] }, ["You like pears"], "Maya est devant toi. Commence par You et garde le verbe like.", "Maya acquiesce. À son tour, elle te tend le carnet de terrain."),
    scene("delivery", "La première fiche de Pip", "Le carnet indique quel fruit chacun a choisi. Prépare la part de Pip.", {
      englishCue: "Feed Pip.", document: doc("Les deux marques", "Sam → apples\nPip → pears"), options: ["Apples", "Pears"], delivery: { picture: "fruit", destinations: ["Sam", "Pip"] } },
    ["Pears | Pip"], "Suis la ligne de Pip jusqu’au fruit, puis donne-lui ce fruit.", "Pip croque sa poire et laisse une petite encoche en forme de lune."),
    scene("write", "Le tour de Sam", "Sam a choisi les pommes. Dis-lui « Tu aimes les pommes » avec you et like.", { englishCue: "Talk to Sam." },
    ["You like apples"], "Tu parles à Sam. Écris le sujet, le verbe, puis le nom du fruit au pluriel.", "Sam reconnaît son choix et te laisse une ligne vierge sur la fiche."),
    scene("write", "Ta place dans le carnet", "À toi de choisir. Écris une phrase commençant par I like pour dire si tu aimes les pommes, les poires ou les deux.", { englishCue: "Write about yourself." },
    ["I like apples", "I like pears", "I like apples and pears", "I like pears and apples", "I like both apples and pears", "I like both pears and apples"],
    "Parle pour toi avec I. Pour les deux fruits ensemble, and veut dire « et ».", "Ton propre choix figure à côté de ceux de Maya et de Sam. Pip reconnaît maintenant ton carnet."),
  ],
  17: [
    scene("spot", "Le palier des semis", "Lis le billet de June. Touche ce que réclame le jeune plant.", {
      lesson: lesson("Exprimer un besoin", "water · de l’eau\nlight · de la lumière\nI need water. · J’ai besoin d’eau.\nIt needs water. · Ce plant a besoin d’eau.", [["It", "Ici, it reprend le jeune plant."], ["needs", "Le verbe need prend un s avec it."], ["water", "Water désigne l’eau."]]),
      document: doc("Le billet sous le pot", "It needs light."), options: ["Water", "Light"], spots: { picture: "supplies", points: [[26, 55], [76, 50]], labels: ["La carafe", "La lampe"] } },
    ["Light"], "Relis le mot placé après needs. Quel objet peut éclairer les feuilles ?", "La lampe s’allume au premier palier. L’escalier pivote d’un quart de tour."),
    scene("choice", "Le message de June", "Sam parle de June, qui a besoin d’eau. Choisis la phrase qu’il peut dire.", {
      lesson: lesson("Le même s avec he, she et it", "He needs light. · Il a besoin de lumière.\nShe needs water. · Elle a besoin d’eau.\nThey need water. · Ils ou elles ont besoin d’eau."),
      options: ["She needs water.", "He needs water.", "She likes water."] },
    ["She needs water."], "Tu parles de June. Le besoin se dit avec needs.", "June reçoit de l’eau pour arroser les plants du deuxième palier."),
    scene("order", "La carafe de Sam", "Sam te montre sa carafe vide. Assemble « Il a besoin d’eau ».", {
      englishCue: "Help Sam.", options: ["water.", "needs", "He"] }, ["He needs water"], "Sam est désigné par he. Au présent, need prend alors un s.", "June remplit la carafe de Sam juste avant que les marches repartent."),
    scene("write", "Une étiquette pour June", "June part arroser. Commence par She et écris en anglais qu’elle a besoin d’eau.", { englishCue: "Write her label." },
    ["She needs water", "She needs some water"], "Le sujet est She. Pense au s à la fin du verbe.", "June attache l’étiquette à sa carafe pour qu’elle revienne au bon étage."),
    scene("write", "Le palier dans l’ombre", "La carafe de Sam est pleine, mais il fait trop sombre pour lire sa carte. De l’eau ou de la lumière ? Écris ce dont il a besoin en commençant par He.", { englishCue: "Help him read." },
    ["He needs light", "He needs some light", "He needs more light", "He needs a light", "He needs a lamp", "He needs the lamp", "He needs a flashlight", "He needs a torch"], "Parle de Sam avec He. Utilise le verbe need et pense à la lumière qui lui manque.", "June allume la lampe. Sam lit enfin sa carte. Quelque chose remue sous les feuilles du palier suivant."),
    scene("write", "La fiche de la petite bête", "Le gardien emploie it pour Pip. Sur sa fiche, écris avec It et like que l’animal aime les poires.", {
      lesson: lesson("Like suit la même règle que need.", "I like apples. · J’aime les pommes.\nIt likes apples. · Cet animal aime les pommes."), englishCue: "Finish Pip’s card." },
    ["It likes pears"], "Après It, ajoute le s à like. Le nom des fruits est au pluriel.", "June fixe ta fiche à la caisse de voyage de Pip. La prochaine équipe saura quoi lui servir."),
  ],
  18: [
    scene("spot", "Une commande à l’oreille", "La table vient d’appeler. Écoute le mot et touche le plat commandé.", {
      lesson: lesson("Pour parler du pain ou de la soupe en général, on dit bread ou soup.", "bread · du pain\nsoup · de la soupe"), radio: { speaker: "Maya", file: "bread", collection: "spell-strike", line: "Bread." },
      options: ["Soup", "Bread"], spots: { picture: "meal", points: [[29, 53], [75, 53]], labels: ["Le bol", "La miche"] } },
    ["Bread"], "Écoute une nouvelle fois. Bread désigne ce que l’on coupe en tranches.", "Le loir pousse la miche vers la première table. Sa louche frappe une deuxième fois."),
    scene("choice", "Qui parle à table ?", "Maya signe au nom de sa table. Quel aliment son groupe aime-t-il ?", {
      lesson: lesson("We nous inclut. They désigne les autres.", "We like bread. · Nous aimons le pain.\nThey like bread. · Ils ou elles aiment le pain."),
      document: doc("Les deux tables", "Maya: We like soup.\nSam: They like bread."), options: ["Soup", "Bread", "Pears"] },
    ["Soup"], "Maya parle pour son groupe. Lis la ligne qui commence par We.", "Le bol part à la table de Maya. Sam regarde les deux pilotes installés en face."),
    scene("order", "Ce que refusent les pilotes", "Les deux pilotes n’aiment pas les poires. Assemble la phrase qui parle d’eux.", {
      lesson: lesson("Avec I, you, we ou they, don’t précède le verbe.", "We don’t like bread. · Nous n’aimons pas le pain.\nThey do not like soup. · Ils n’aiment pas la soupe.", [["They", "Ici, ce sont les deux pilotes."], ["don’t", "Forme courte de do not."], ["like", "Après don’t, like garde sa forme de base."]]),
      options: ["pears.", "like", "They", "don’t"] }, ["They don't like pears"], "D’abord les personnes, puis don’t, puis le verbe like.", "Les poires restent pour Pip. Les deux pilotes gardent leur plateau de pain."),
    rush(18, "Le loir bat quatre coups pour trier les étiquettes du service.", [
      ["Maya parle pour sa table. « ___ like soup. »", "We", "She", "It"],
      ["Deux pilotes ont besoin d’eau. Complète « They ___ water. »", "need", "needs", "is"],
      ["Sur la fiche de Pip, complète « It ___ pears. »", "likes", "like", "am"],
      ["« We don’t like soup. » Quel plat la table refuse-t-elle ?", "La soupe", "Le pain", "Les poires"] ]),
    scene("write", "Le billet de ta table", "Toi et Maya aimez la soupe. Écris au loir en commençant par We.", { englishCue: "Write for your table." },
    ["We like soup"], "We parle au nom du groupe. Ici le verbe like garde sa forme de base.", "Le loir lit votre billet et remplit le second bol."),
    scene("write", "La relève du service", "Les deux pilotes n’aiment pas la soupe. Laisse un mot qui parle d’eux en utilisant They et le verbe like.", { englishCue: "Leave a note." },
    ["They don't like soup", "They do not like soup"], "La négation se place entre They et like. Don’t et do not conviennent tous les deux.", "La relève garde la soupe au chaud pour les autres. Cinq notes résonnent alors dans la baie."),
  ],
  19: [
    scene("choice", "La première réponse", "Sam interroge les pilotes sur leurs goûts. De quel aliment parle-t-il ?", {
      englishCue: "Read the signal.", lesson: lesson("Poser une question sur les goûts", "You like bread. · Tu aimes le pain.\nDo you like bread? · Est-ce que tu aimes le pain ?", [["Do", "Ici, do ouvre la question sur les goûts."], ["you", "Tu ou vous. Tu peux parler à une personne ou à plusieurs."], ["like", "Après Do you, le verbe garde sa forme de base."]]),
      document: doc("Signal reçu", "Do you like pears?"), options: ["Pears", "Apples", "Bread"] },
    ["Pears"], "Le dernier mot de la question désigne l’aliment.", "La radio est accordée. À chaque question, cinq petites lampes attendent une réponse."),
    scene("choice", "La voix derrière la brume", "Lina répond pour elle-même. Que sais-tu maintenant de ses goûts ?", {
      englishCue: "Read Lina’s reply.", lesson: lesson("Une réponse courte reprend do.", "Yes, I do. · Oui, j’aime ça.\nNo, I don’t. · Non, je n’aime pas ça."),
      document: doc("L’échange radio", "Sam: Do you like pears?\nLina: No, I don’t."), options: ["Elle aime les poires.", "Elle n’aime pas les poires."] },
    ["Elle n’aime pas les poires."], "Retrouve le nom du fruit dans la question, puis lis la réponse de Lina.", "Tu notes le goût de Lina dans le carnet. De l’autre côté de l’eau, elle se penche à nouveau vers le micro."),
    scene("order", "À toi le micro", "Demande à la pilote si elle aime la soupe.", {
      englishCue: "Ask about soup.", options: ["you", "soup?", "Do", "like"] }, ["Do you like soup"], "Place Do devant la personne à qui tu parles, puis le verbe.", "La pilote entend ta question malgré la brume. Une lampe bleue clignote deux fois."),
    scene("write", "Ta réponse à Lina", "Lina te demande « Do you like soup? ». Réponds pour toi avec la réponse courte en anglais, par oui ou par non.", {
      englishCue: "Reply to Lina." }, ["Yes I do", "No I don't", "No I do not"], "Donne ton propre avis. Commence par Yes ou No et réponds avec I et do ou don’t.", "Lina répète ta réponse dans son journal radio. Une autre voix vient de prendre le micro."),
    scene("write", "La question de l’autre rive", "Le deuxième pilote est au micro. Demande-lui en anglais s’il aime les pommes, en utilisant like.", { englishCue: "Ask the pilot." },
    ["Do you like apples"], "Adresse-toi au pilote avec you. Quel mot ouvre la question au présent simple ?", "Le pilote répond « Yes, I do! ». La dernière lampe s’allume et le quai donne le départ."),
  ],
  20: [
    scene("choice", "Un dernier message de la serre", "À qui la jardinière demande-t-elle de prendre la carte ?", {
      englishCue: "Read June’s note.", document: doc("Sur le guidon", "Sam, your map is in my bag. You can take it. — June"), options: ["Sam", "June", "Pip"] },
    ["Sam"], "Lis le prénom avant la virgule. June s’adresse directement à cette personne.", "Sam retrouve sa carte. Une ligne de câble traverse la baie de part en part."),
    scene("evidence", "Le bon panier pour Pip", "Épingle les deux indices qui permettent de choisir le panier de Pip. Quel panier lui convient ?", {
      englishCue: "Find two clues.", clues: [doc("Fiche du verger", "Pip likes pears."), doc("Bordereau des paniers", "Blue bag: pears. Red bag: apples."), doc("Le billet de June", "I need light.")],
      options: ["The blue bag", "The red bag"] }, ["0+1 | The blue bag"], "Il te faut une pièce sur le goût de Pip et une autre sur le contenu des sacs.", "Les poires sont dans le sac bleu. Pip saute dans la nacelle en les sentant."),
    scene("delivery", "Deux places dans la nacelle", "Les pilotes ont soif. Lis leur demande et charge ce qu’il faut pour eux.", {
      englishCue: "Pack for the pilots.", document: doc("Le manifeste", "Pilots: We need water.\nPip: pears."), options: ["Water", "Pears"], delivery: { picture: "cargo", destinations: ["The pilots", "Pip"] } },
    ["Water | The pilots"], "Les pilotes disent we en parlant d’eux-mêmes. Que demandent-ils après need ?", "La gourde est calée contre le sac. Au-dessus de la baie, le câble se tend."),
    scene("write", "Une voix au-dessus de l’eau", "Avant de préparer un sandwich pour Lina, demande-lui en anglais si elle aime le pain. Utilise le verbe like.", { englishCue: "Ask Lina." },
    ["Do you like bread"], "Tu parles à Lina. Pose une question avec Do, puis le sujet, puis like.", "« Yes, I do! » Lina fait tinter sa sonnette. Vous la retrouverez de l’autre côté."),
    scene("choice", "Le fanal de la rive", "Lis le message d’accueil. Quel aliment attend l’équipe au débarcadère ?", {
      englishCue: "Read the welcome note.", document: doc("Le fanal", "We have soup. We don’t have bread."), options: ["Soup", "Bread", "Water"] },
    ["Soup"], "Dans la première phrase, have indique ce qu’il y a. Don’t have indique ce qui manque.", "La marmite fume sur le ponton. Le vent emporte déjà l’odeur jusqu’à vous."),
    scene("order", "À qui est la carte ?", "Rappelle à Sam que la carte lui appartient. Commence par This.", {
      englishCue: "Return the map.", options: ["your", "This", "map.", "is"] }, ["This is your map"], "Adresse-toi à Sam. Réutilise le petit mot du musée qui veut dire « ton ».", "Sam replie la carte. Tu peux envoyer tes deux dernières informations au refuge."),
    scene("write", "Ton message au refuge", "Écris deux phrases en anglais pour prévenir le refuge. Utilise It et like pour Pip, We et need pour ton équipe. Tu choisis l’ordre.", {
      englishCue: "Send your message.", document: { label: "Billet de traversée", text: "Pip · aime les poires.\nNotre équipe · gourdes vides, eau à prévoir.", lang: "fr" } },
    ["It likes pears", "It really likes pears"].flatMap(taste =>
      ["We need water", "We need some water", "We need more water", "We need drinking water"].flatMap(need => [`${taste}. ${need}`, `${need}. ${taste}`])),
    "Pour Pip, pense au s du verbe like. Pour ton équipe, emploie le verbe de besoin avec We. Les deux informations sont nécessaires.", "Le refuge prépare les poires pour Pip et l’eau pour votre équipe. Votre message a bien traversé la baie."),
  ],
};

for (const id of [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 14, 16, 19]) {
  const episode = scenes[id];
  episode.push(scene("quiz", "Le carnet de bord", "Réponds aux trois questions pour valider ton escale.", {}, [],
    "Vérifie à nouveau tes réponses. Tu peux aussi revoir les indices du décor.",
    "Les trois réponses du carnet sont justes. Cette escale est validée."));
}
