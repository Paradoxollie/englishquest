const fs = require('fs');
const path = require('path');

const listDir = path.join('d:', 'Englishquest', 'englishquest', 'lib', 'courses', 'list');
const outputFile = path.join('d:', 'Englishquest', 'englishquest', 'lib', 'courses', 'lessons.tsx');

const files = fs.readdirSync(listDir).filter(f => f.match(/^course\d+\.tsx$/));
const courseIds = files.map(f => parseInt(f.match(/^course(\d+)\.tsx$/)[1])).sort((a, b) => a - b);

console.log(`Found ${courseIds.length} course files.`);

let content = `/**
 * Contenu des cours de grammaire
 * Refactorisé : chaque cours est dans un fichier séparé dans /list
 */

import { LessonContent } from "@/lib/courses/types";
export * from "@/lib/courses/types";

// Imports
`;

courseIds.forEach(id => {
    content += `import { course${id} } from "./list/course${id}";\n`;
});

content += `\nexport const lessons: Record<number, LessonContent> = {\n`;

courseIds.forEach(id => {
    content += `  ${id}: course${id},\n`;
});

content += `};\n`;

fs.writeFileSync(outputFile, content);
console.log("Generated lessons.tsx");
