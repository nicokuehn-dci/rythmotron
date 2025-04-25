import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment variables:', process.env.NODE_ENV);

const filesToCheck = [
  'package.json',
  'vite.config.js',
  'svelte.config.js',
  'tailwind.config.js',
  'src/app.html',
  'src/routes/+page.svelte',
  'src/routes/+layout.svelte', // Pe532
  'src/app/app.css' // P89d4
];

console.log('\nChecking for required files:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${file}: ${exists ? '✓ Found' : '❌ Missing'}`);
});

const packageJsonContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
const packageJson = JSON.parse(packageJsonContent);
console.log('\nAvailable npm scripts:');
for (const [script, command] of Object.entries(packageJson.scripts || {})) {
  console.log(`- npm run ${script}: ${command}`);
}
