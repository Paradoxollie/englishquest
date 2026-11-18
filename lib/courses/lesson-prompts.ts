export type LessonPrompt = {
  situation: string;
  answer: string;
  explanation: string;
};

export const lessonPrompts: Record<number, LessonPrompt> = {
  1: {
    situation: "Tu arrives à l’accueil. Dis en anglais que tu as onze ans et que tu as froid.",
    answer: "I’m eleven and I’m cold.",
    explanation: "En anglais, l’âge et la sensation se construisent ici avec be. I’m eleven years old convient également.",
  },
  2: {
    situation: "Ton ami demande pourquoi ton livre est dans ton sac. Tu lis un roman en anglais ce mois-ci. Que lui dis-tu ?",
    answer: "I’m reading a novel in English this month.",
    explanation: "Cette lecture est une activité temporaire qui s’étend sur plusieurs jours.",
  },
  3: {
    situation: "Maya prend parfois le bus. Dis-le de deux façons avec sometimes.",
    answer: "Maya sometimes takes the bus. Sometimes Maya takes the bus.",
    explanation: "Sometimes peut précéder takes ou ouvrir la phrase. Takes porte le -s de la troisième personne.",
  },
  4: {
    situation: "Tu habites à Paris, mais tu vis à York pendant trois semaines. Comment l’expliques-tu ?",
    answer: "I live in Paris, but I’m staying in York for three weeks.",
    explanation: "Live présente ton lieu de vie habituel. Am staying souligne la durée limitée du séjour.",
  },
  5: {
    situation: "La sonnette retentit. Demande d’abord qui habite ici, puis avec qui Sam habite.",
    answer: "Who lives here? Who do you live with, Sam?",
    explanation: "Dans la première question, who est le sujet. Dans la seconde, c’est you.",
  },
  6: {
    situation: "Le serveur propose de la viande. Comment lui dire que tu n’en manges jamais ?",
    answer: "I never eat meat.",
    explanation: "Never exprime déjà la négation. On peut aussi dire I don’t eat meat at all.",
  },
  7: {
    situation: "Tu retrouves un téléphone dont l’écran est cassé. Présente-le, puis parle de son écran.",
    answer: "It’s a phone. Its screen is broken.",
    explanation: "It’s signifie it is dans la première phrase. Its accompagne le nom screen dans la seconde.",
  },
  8: {
    situation: "Une amie entend un bruit devant la porte. Annonce la présence d’un chien, puis dis de quelle couleur il est.",
    answer: "There’s a dog outside. It’s brown.",
    explanation: "There’s introduit le chien. It reprend l’animal dont vous parlez.",
  },
  9: {
    situation: "Tu prépares une tarte. Demande s’il reste des pommes et propose un peu de thé.",
    answer: "Have we got any apples? Would you like some tea?",
    explanation: "Any convient à la question ouverte. Some est naturel quand on offre quelque chose.",
  },
  10: {
    situation: "Un ami voit une chouette pour la première fois. Présente-la, puis dis que cette chouette est blanche.",
    answer: "There’s an owl. The owl is white.",
    explanation: "Le son voyelle au début de owl appelle an. La deuxième fois, l’oiseau est identifié.",
  },
  11: {
    situation: "Ta sœur te demande pourquoi tu as un plâtre. Dis que tu t’es cassé le bras hier.",
    answer: "I broke my arm yesterday.",
    explanation: "Yesterday situe l’accident dans un passé terminé. Son résultat est encore visible.",
  },
  12: {
    situation: "Au moment où le téléphone a sonné, tu préparais le dîner. Raconte la scène.",
    answer: "I was cooking dinner when the phone rang.",
    explanation: "Was cooking décrit le décor. Rang fait avancer le récit.",
  },
  13: {
    situation: "Avant, tu prenais le bus pour aller travailler. Aujourd’hui, tu marches. Raconte ce changement.",
    answer: "I used to take the bus to work. Now I walk.",
    explanation: "Used to introduit une ancienne habitude. À voix haute, le to est souvent réduit.",
  },
  14: {
    situation: "Le verre glisse de la table. Lance un avertissement avec going to.",
    answer: "Watch out! The glass is going to fall.",
    explanation: "La position du verre te fait prévoir sa chute.",
  },
  15: {
    situation: "Tu as finalement réussi à ouvrir une porte coincée. Fais comprendre que tu as vraiment réussi.",
    answer: "I finally managed to open the door.",
    explanation: "Managed to annonce le résultat obtenu. I was able to open it convient aussi dans ce récit.",
  },
  16: {
    situation: "À l’hôtel, le départ avant huit heures est facultatif. Comment rassurer quelqu’un qui veut dormir ?",
    answer: "You don’t have to leave before eight.",
    explanation: "Don’t have to laisse le choix. Mustn’t donnerait un ordre très différent.",
  },
  17: {
    situation: "Il est 8 h 55 et le train part à 9 heures. Que peux-tu dire à l’ami qui t’accompagne ?",
    answer: "We’d better hurry or we’ll miss the train.",
    explanation: "We’d better inclut ton ami et toi dans le conseil.",
  },
  18: {
    situation: "Présente Maya comme ta meilleure amie et indique qu’elle est plus grande que toi.",
    answer: "Maya is my best friend. She’s taller than me.",
    explanation: "My détermine déjà best friend. Taller than compare deux personnes.",
  },
  19: {
    situation: "Il te manque du temps et des chaises. Pose une question pour chaque quantité.",
    answer: "How much time do we have? How many chairs do we need?",
    explanation: "Time est indénombrable dans ce sens. Chairs se compte.",
  },
  20: {
    situation: "Tu as raté le bus et tu es rentré à pied. Raconte-le une fois avec because et une fois avec so.",
    answer: "I walked home because I missed the bus. I missed the bus, so I walked home.",
    explanation: "Because introduit la raison. So annonce le résultat.",
  },
  21: {
    situation: "On te propose de revoir un film que tu as déjà vu. Déplace already entre tes deux réponses.",
    answer: "I’ve already seen it. I’ve seen it already.",
    explanation: "Les deux ordres sont naturels. Already en fin de phrase peut être un peu plus appuyé.",
  },
  22: {
    situation: "Tu demandes à quelqu’un s’il a visité Londres, puis quand il y est allé pour la dernière fois.",
    answer: "Have you ever been to London? When did you last go?",
    explanation: "La première question fait le bilan de ses voyages. La seconde cherche un moment précis.",
  },
  23: {
    situation: "Tu n’habites plus à Cork. Dis que tu y as vécu pendant deux ans avant de déménager.",
    answer: "I lived in Cork for two years before I moved.",
    explanation: "For mesure aussi une durée entièrement passée.",
  },
  24: {
    situation: "Tu t’entraînes en courant cinq kilomètres chaque matin. Qu’expliques-tu à ton partenaire ?",
    answer: "I’ve been running five kilometres every morning.",
    explanation: "La quantité fait partie de chaque entraînement. La forme continue décrit l’activité répétée.",
  },
  25: {
    situation: "Au cinéma, demande combien de temps dure le film. Dans la file, demande à une amie depuis quand elle attend.",
    answer: "How long does the film last? How long have you been waiting?",
    explanation: "L’une des questions porte sur la durée prévue, l’autre sur une attente déjà commencée.",
  },
  26: {
    situation: "Il est quinze heures. Tu as déjà vu Maya deux fois aujourd’hui. Fais le bilan de ta journée.",
    answer: "I’ve seen Maya twice today.",
    explanation: "Le present perfect fait le bilan jusqu’à maintenant. I saw Maya at ten raconte une rencontre précise.",
  },
  27: {
    situation: "Ton ami vient de dire que son sac est lourd. Propose de le porter.",
    answer: "I’ll carry it for you.",
    explanation: "I’ll convient à une proposition que tu fais sur le moment.",
  },
  28: {
    situation: "Le bus ferme ses portes alors que tu es encore au bout de la rue. Dis ce que tu penses qu’il va se passer.",
    answer: "We’re going to miss the bus. / I think we’ll miss the bus.",
    explanation: "Tu peux attirer l’attention sur l’indice visible ou présenter la même prévision comme ton avis.",
  },
  29: {
    situation: "Sam est absent. Propose une explication possible sans avoir de certitude.",
    answer: "He might be ill. / Maybe he’s ill.",
    explanation: "Might be est un groupe verbal. Maybe est un adverbe et la phrase garde son verbe.",
  },
  30: {
    situation: "La valise dépasse la limite de poids. Dis pourquoi tu ne peux pas la prendre en cabine.",
    answer: "It’s too heavy to take on the plane as hand luggage.",
    explanation: "Too heavy indique que le poids dépasse ici une limite.",
  },
  31: {
    situation: "Ton amie se perd facilement. Dis-lui de t’appeler si elle perd son chemin.",
    answer: "If you get lost, call me.",
    explanation: "Le présent suit if. Call me est une consigne directe.",
  },
  32: {
    situation: "Tu as un billet de tombola. Imagine ce que tu ferais si tu gagnais demain.",
    answer: "If I won tomorrow, I’d take my family on holiday.",
    explanation: "La victoire est envisagée comme peu probable. Le prétérit won exprime la distance avec la réalité actuelle.",
  },
  33: {
    situation: "Une fresque vient d’être présentée. Écris une légende qui donne le nom de son auteur.",
    answer: "The mural was painted by Maya.",
    explanation: "Le passif met la fresque en tête. By introduit l’artiste.",
  },
  34: {
    situation: "L’atelier t’a envoyé deux messages sur tes vélos, l’un pendant le travail et l’autre à la fin. Que disent-ils ?",
    answer: "Your bikes are being repaired. Your bikes have been repaired.",
    explanation: "Being indique le travail en cours. Have been repaired annonce le résultat au pluriel.",
  },
  35: {
    situation: "Maya t’a dit hier qu’elle habite York. Elle y habite toujours. Rapporte l’information.",
    answer: "Maya said she lives in York. / Maya said she lived in York.",
    explanation: "Le présent confirme que l’information reste vraie. Le décalage au passé est également possible.",
  },
  36: {
    situation: "Tu cherches la gare. Pose une question polie qui commence par Do you know.",
    answer: "Do you know where the station is?",
    explanation: "La proposition introduite par where conserve l’ordre the station is.",
  },
  37: {
    situation: "Réunis les deux phrases en une seule. I met a woman. She speaks Italian.",
    answer: "I met a woman who speaks Italian.",
    explanation: "Who remplace le sujet she. That est aussi possible dans cette relative.",
  },
  38: {
    situation: "Réunis ces deux phrases en laissant le relatif objet sous-entendu. That’s the book. You lent it to me.",
    answer: "That’s the book you lent me.",
    explanation: "Le sujet de lent est you. L’objet manquant renvoie à the book.",
  },
  39: {
    situation: "Ton ami marchait. Il s’est arrêté pour fumer une cigarette. Traduis cette pause.",
    answer: "He stopped to smoke a cigarette.",
    explanation: "To smoke indique le but. He stopped smoking voudrait dire qu’il a cessé de fumer.",
  },
  40: {
    situation: "Lors d’un appel, demande à Sam d’attendre devant la gare en employant want.",
    answer: "I want you to wait outside the station, Sam.",
    explanation: "La construction est want + personne + to + verbe. Pour une demande plus douce, on peut dire Could you wait outside?",
  },
  41: {
    situation: "Tu as raté un train en partant tard. Imagine ce qui aurait changé avec un départ plus tôt.",
    answer: "If I had left earlier, I would have caught the train.",
    explanation: "La condition peut aussi venir après le résultat.",
  },
  42: {
    situation: "Tu as déjà envoyé un message au mauvais destinataire. Exprime un regret avec wish.",
    answer: "I wish I hadn’t sent that message.",
    explanation: "Le past perfect renvoie à l’envoi passé que tu voudrais changer.",
  },
  43: {
    situation: "À 21 heures demain tu seras en plein trajet. Avant 23 heures tu seras arrivé. Annonce les deux.",
    answer: "At nine I’ll be travelling. By eleven I’ll have arrived.",
    explanation: "At nine montre l’activité en cours. By eleven fixe l’échéance du résultat.",
  },
  44: {
    situation: "Quand tu es arrivé, tes amis étaient déjà partis. Pourrais-tu les avoir croisés à leur départ ? Dis-le en anglais.",
    answer: "They had already left when I arrived, so I missed them.",
    explanation: "Le départ précède ton arrivée. When I arrived, they left raconterait la scène dans l’autre ordre.",
  },
  45: {
    situation: "La boutique est fermée et le personnel est déjà rentré chez lui. Ta montre indique l’heure de fermeture. Formule ta déduction comme si tu arrivais devant la porte.",
    answer: "They must have closed for the day.",
    explanation: "Must have + participe passé rend ta forte déduction explicite.",
  },
  46: {
    situation: "Ton écran est cassé. Tu vas confier la réparation à un professionnel. Écris ton message à un ami.",
    answer: "I’m going to have my screen repaired.",
    explanation: "Have + objet + participe passé décrit le service que tu fais réaliser.",
  },
  47: {
    situation: "Le chemin était inondé et vous êtes quand même arrivés à l’heure. Fais deux phrases avec although puis despite.",
    answer: "Although the path was flooded, we arrived on time. Despite the flooding, we arrived on time.",
    explanation: "Although introduit un sujet et un verbe. Despite peut introduire un nom.",
  },
  48: {
    situation: "Tu acceptes une invitation au café. Termine ton message en disant que tu as hâte de revoir ton ami.",
    answer: "I’m looking forward to seeing you again.",
    explanation: "To est une préposition dans look forward to. Le verbe suivant prend -ing.",
  },
  49: {
    situation: "La radio est trop forte. Utilise it dans ta demande pour que ton ami baisse le son.",
    answer: "Could you turn it down, please?",
    explanation: "Avec ce verbe séparable, le pronom se place entre turn et down.",
  },
  50: {
    situation: "Tu dois aller chercher Maya, la déposer au théâtre puis faire le plein. Raconte ces trois étapes à Sam.",
    answer: "I’ll pick Maya up, drop her off at the theatre and get some petrol. We’ve nearly run out.",
    explanation: "Pick someone up et drop someone off décrivent deux actions différentes. Run out of petrol explique l’arrêt à la station.",
  },
};
