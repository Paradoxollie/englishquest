const fs = require('fs');
const path = require('path');

const inputFile = path.join('d:', 'Englishquest', 'englishquest', 'lib', 'courses', 'lessons.tsx');
const outputDir = path.join('d:', 'Englishquest', 'englishquest', 'lib', 'courses', 'list');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Backup just in case
fs.copyFileSync(inputFile, inputFile + '.bak');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let currentCourseId = null;
let currentBuffer = [];
let insideCourse = false;
let extractionCount = 0;

const header = `import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

`;

console.log("Starting extraction...");

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd(); // Remove \r if present

    // Strict match for start: "  1: {" (2 spaces)
    const startMatch = line.match(/^  (\d+): \{/);

    // Strict match for end: "  }," (2 spaces)
    const endMatch = line.match(/^  \},?$/);

    // One-liner detection: Matches Start AND End in the same line?
    // Ex: "  21: { ... }, "
    // Note: It ends with "}," or "}" usually.
    const isOneLiner = startMatch && line.trimEnd().match(/\},?$/);

    if (isOneLiner) {
        currentCourseId = startMatch[1];
        // Construct content
        // But I need to transform "  21: { ... }" to "export const course21: LessonContent = { ... }"
        // The content inside the braces is `courseNumber: 21, ...`
        // I'll just strip "  21: " and append "export const course21: LessonContent = "
        const restOfLine = line.substring(line.indexOf('{')); // "{ ... },"
        // Remove trailing comma if exists
        let cleanContent = restOfLine;
        if (cleanContent.endsWith(',')) cleanContent = cleanContent.slice(0, -1);

        const fileContent = header + `export const course${currentCourseId}: LessonContent = ${cleanContent};`;
        fs.writeFileSync(path.join(outputDir, `course${currentCourseId}.tsx`), fileContent);
        console.log(`Extracted Course ${currentCourseId} (One-liner)`);
        extractionCount++;
        continue;
    }

    if (startMatch && !insideCourse) {
        currentCourseId = startMatch[1];
        insideCourse = true;
        currentBuffer = [];

        // Start the object definition
        currentBuffer.push(`export const course${currentCourseId}: LessonContent = {`);

        // If there's content on the same line after "{", add it (rare but possible)
        // logic: line is "  20: {" -> nothing else.
        continue;
    }

    if (endMatch && insideCourse) {
        // Close the object
        currentBuffer.push("};");

        // Write file
        const fileContent = header + currentBuffer.join('\n');
        fs.writeFileSync(path.join(outputDir, `course${currentCourseId}.tsx`), fileContent);
        console.log(`Extracted Course ${currentCourseId}`);
        extractionCount++;

        insideCourse = false;
        currentCourseId = null;
        currentBuffer = [];
        continue;
    }

    if (insideCourse) {
        // De-indent by 2 spaces
        let processedLine = line;
        if (processedLine.startsWith('    ')) {
            processedLine = processedLine.substring(2);
        } else if (processedLine.startsWith('  ')) {
            // Should not happen for content indented at 4 spaces, but just in case
            // processedLine = processedLine.substring(2);
        }
        currentBuffer.push(processedLine);
    }
}

console.log(`Extraction complete. Extracted ${extractionCount} courses.`);
