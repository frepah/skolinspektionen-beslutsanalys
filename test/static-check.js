const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'src', 'AnalysisWorkbook.gs');
const source = fs.readFileSync(sourcePath, 'utf8');

const requiredFunctions = [
  'setupAnalysisWorkbook',
  'validateAnalysisWorkbook',
  'onOpen',
  'runAnalysisWorkbookSmokeTest'
];

for (const functionName of requiredFunctions) {
  const pattern = new RegExp(`function\\s+${functionName}\\s*\\(`);
  if (!pattern.test(source)) {
    throw new Error(`Missing required function: ${functionName}`);
  }
}

const forbiddenDefaults = [
  "STORE_FULL_TEXT: 'JA'",
  "ALLOW_FULL_TEXT_STORAGE: 'JA'",
  "LOG_FULL_TEXT: 'JA'",
  "LOG_PROMPTS: 'JA'",
  "AI_ALLOW_PAID_USAGE: 'JA'",
  "ALLOW_PAID_SERVICES: 'JA'",
  "ALLOW_EXTERNAL_AI: 'JA'"
];

for (const forbidden of forbiddenDefaults) {
  if (source.includes(forbidden)) {
    throw new Error(`Forbidden default found: ${forbidden}`);
  }
}


if (!source.includes('function normalizeSettingValue_')) {
  throw new Error('Missing setting normalization helper.');
}

if (source.includes("String(settings[key] || '')")) {
  throw new Error('Settings validation must not treat numeric zero as an empty value.');
}

new Function(source.replace(/function onOpen\(\)[\s\S]*?\.addToUi\(\);\n}/, 'function onOpen() {}'));
console.log('Static checks passed.');
