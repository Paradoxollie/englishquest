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
      lesson: lesson("Deux mots pour le quai", "Hello! · Bonjour !\nGoodbye! · Au revoir !"), options: ["Hello!", "Goodbye!"] },
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
    scene("choice", "Le sac de Maya", "Maya cherche une clé. Quel mot choisis-tu sur l’inventaire ?", {
      lesson: lesson("A veut dire « un » ou « une » devant ces objets.", "a key · une clé\na bag · un sac\na map · une carte"),
      options: ["a bag", "a map", "a key"] }, ["a key"], "Map sert à trouver son chemin. Bag permet de transporter des affaires.", "A key, c’est une clé. Elle ouvre le boîtier de la balise."),
    scene("choice", "L’abri sous le grand arbre", "Sous un parapluie, Maya trouve deux sacs. Lequel demande-t-elle ?", {
      lesson: lesson("En anglais, la couleur vient avant l’objet.", "a red key · une clé rouge\na blue key · une clé bleue"),
      document: doc("Le mot de Maya", "Hello! A red bag, please."), options: ["Un sac bleu", "Un sac rouge", "Une clé rouge"] },
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
    scene("choice", "Deux noms au générique", "Qui chante dans le film ?", {
      lesson: lesson("Un métier après a", "a singer · un chanteur, une chanteuse\na pilot · un pilote, une pilote"),
      document: doc("Les badges des artistes", "MIRA · singer\nLEO · pilot"), options: ["Mira", "Leo"] },
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
    scene("choice", "Deux réponses", "À qui dois-tu remettre le bon de vol ?", {
      lesson: lesson("Répondre pour soi", "Yes, I am. · Oui.\nNo, I’m not. · Non."),
      document: doc("Question aux deux coursiers", "Are you the pilot?\nJo: No, I’m not.\nKit: Yes, I am."), options: ["Jo", "Kit"] },
    ["Kit"], "C’est la personne qui répond oui à la question.", "Kit pilote le planeur. Jo reste au guichet pour trier le courrier."),
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
  ],
  9: [
    scene("choice", "Le panneau de la gare", "Le panneau indique Turn right. Quel aiguillage faut-il préparer ?", {
      lesson: lesson("Deux directions", "Turn left. · Tourne à gauche.\nTurn right. · Tourne à droite."), options: ["À gauche", "À droite"] },
    ["À droite"], "Right correspond à la droite.", "Sam déverrouille l’aiguillage de droite. Le wagon peut quitter le quai."),
    scene("choice", "Le signal fixe", "Que dois-tu faire au deuxième signal ?", {
      lesson: lesson("Sur une voie toute droite", "Go straight. · Va tout droit.\nStop. · Arrête-toi.\nThen · ensuite"),
      document: doc("Les deux signaux", "Go straight. Then stop."), options: ["Aller tout droit", "M’arrêter", "Tourner à gauche"] },
    ["M’arrêter"], "Then annonce l’action suivante.", "Le wagon s’arrête devant le premier poste d’aiguillage."),
    scene("route", "Aux commandes du rail", "Règle les deux aiguillages dans l’ordre du billet.", {
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
};

for (const episode of Object.values(scenes)) {
  episode.push(scene("quiz", "Le carnet de bord", "Réponds aux trois questions pour valider ton escale.", {}, [],
    "Vérifie à nouveau tes réponses. Tu peux aussi revoir les indices du décor.",
    "Les trois réponses du carnet sont justes. Cette escale est validée."));
}
