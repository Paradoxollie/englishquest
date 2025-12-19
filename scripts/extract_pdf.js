const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'Grammar in use.pdf');

if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found at ${pdfPath}`);
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    fs.writeFileSync(path.join(__dirname, '..', 'grammar_dump.txt'), data.text, 'utf8');
    console.log('Done writing grammar_dump.txt');
}).catch(function (error) {
    console.error('Error parsing PDF:', error);
});
