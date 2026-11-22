export type AtlasQuestion = [prompt: string, correct: string, other: string, another: string];
// A draw takes one question from each pair, then shuffles prompts and choices.
export const quizBank: Record<number, AtlasQuestion[]> = {
  1: [
    ["Tu arrives devant un nouveau robot. Que dis-tu ?", "Hello!", "Goodbye!", "Bye!"],
    ["Un membre de l’équipe te dit « Hi! ». Que fait-il ?", "Il te salue.", "Il part.", "Il donne son nom."],
    ["« Hello, Sam. I’m Sky. » Quel est le nom de la personne qui parle ?", "Sky", "Sam", "Maya"],
    ["« Hi, Nova! I am Maya. » Qui se présente ?", "Maya", "Nova", "Sam"],
    ["Quelle phrase annonce que ton badge dit Nova ?", "I am Nova.", "I am Sky.", "Goodbye, Nova!"],
    ["Tu quittes le quai. Quelle formule convient ?", "Goodbye!", "I am Maya.", "Hello!"],
  ],
  2: [
    ["Quel objet est a map ?", "Une carte", "Une clé", "Un sac"],
    ["Quel objet est a key ?", "Une clé", "Une carte", "Un sac"],
    ["Tu cherches a blue bag. Lequel prends-tu ?", "Le sac bleu", "Le sac rouge", "La carte bleue"],
    ["Tu cherches a red key. Laquelle prends-tu ?", "La clé rouge", "La clé bleue", "La carte rouge"],
    ["Quelle étiquette signifie « une carte bleue » ?", "a blue map", "a red map", "a blue bag"],
    ["Quelle étiquette signifie « un sac rouge » ?", "a red bag", "a blue bag", "a red key"],
  ],
  3: [
    ["Tu parles de toi. « I ___ a map. »", "have", "has", "is"],
    ["« J’ai une clé. » Quel message convient ?", "I have a key.", "Sam has a key.", "I have a bag."],
    ["Tu parles de Maya. « Maya ___ a bag. »", "has", "have", "am"],
    ["Quelle phrase dit que Sam possède la carte ?", "Sam has the map.", "I have the map.", "Sam has the key."],
    ["« I’m Nova. I have a blue bag. Maya has a red bag. » Qui a le sac bleu ?", "Nova", "Maya", "Sam"],
    ["« I’m Sam. Maya has a blue key. I have a red key. » Qui a la clé rouge ?", "Sam", "Maya", "Nova"],
  ],
  4: [
    ["« The map is in the bag. » Où est la carte ?", "Dans le sac", "Sur le sac", "Sous le sac"],
    ["La clé est dans le sac. Choisis le mot manquant. « The key is ___ the bag. »", "in", "on", "under"],
    ["« The key is under the map. » Où est la clé ?", "Sous la carte", "Sur la carte", "Dans le sac"],
    ["Quel mot signifie « sous » dans ce quai anglais ?", "under", "in", "on"],
    ["Le message dit « The red key is on the bag ». Que sais-tu ?", "La clé rouge est sur le sac.", "La clé rouge est dans le sac.", "La clé bleue est sur le sac."],
    ["« The blue map is on the bag ». Que cherches-tu ?", "Une carte bleue sur le sac", "Une clé bleue dans le sac", "Une carte rouge sous le sac"],
  ],
  5: [
    ["« Hello, Maya. I’m Sky. I have the bag. » Qui a le sac ?", "Sky", "Maya", "Sam"],
    ["« Hi, Sam. I’m Nova. I have a key. » Qui a la clé ?", "Nova", "Sam", "Maya"],
    ["« The map is under the table. The key is on the table. » Où est la carte ?", "Sous la table", "Sur la table", "Dans le sac"],
    ["« The map is on the bag. The key is in the bag. » Où est la clé ?", "Dans le sac", "Sur le sac", "Sous la carte"],
    ["Tu es Sam et tu as la clé bleue. Quel message t’identifie correctement ?", "I’m Sam. I have the blue key.", "I’m Maya. I have the blue key.", "I’m Sam. I have the red key."],
    ["Tu es Maya et ta carte est sous le sac. Quel message envoies-tu ?", "I’m Maya. The map is under the bag.", "I’m Sam. The map is under the bag.", "I’m Maya. The map is on the bag."],
  ],
};
