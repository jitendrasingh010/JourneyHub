const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));

let result = '';
data.forEach(file => {
  const unused = file.messages
    .filter(m => m.ruleId === 'no-unused-vars' || m.ruleId === 'no-undef' || m.ruleId === 'react-hooks/exhaustive-deps')
    .map(m => `Line ${m.line}: ${m.message}`);

  if (unused.length > 0) {
    const fileName = file.filePath.split('frontend\\\\')[1] || file.filePath;
    result += `### ${fileName}\n`;
    unused.forEach(u => {
      result += `- ${u}\n`;
    });
    result += '\n';
  }
});

fs.writeFileSync('unused-summary.md', result, 'utf8');
console.log('Summary created in unused-summary.md');
