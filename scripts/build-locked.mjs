import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Create dist directories
const distDir = path.join(projectRoot, 'dist');
const distCss = path.join(distDir, 'css');
const distJs = path.join(distDir, 'js');

// Ensure directories exist
fs.mkdirSync(distCss, { recursive: true });
fs.mkdirSync(distJs, { recursive: true });

// Copy CSS files
const srcCss = path.join(projectRoot, 'src', 'css');
fs.cpSync(srcCss, distCss, { recursive: true, force: true });

// Copy JS files
const srcJs = path.join(projectRoot, 'src', 'js');
fs.cpSync(srcJs, distJs, { recursive: true, force: true });

// Copy locked.html as index.html
const srcHtml = path.join(projectRoot, 'src', 'locked.html');
const destHtml = path.join(distDir, 'index.html');
fs.copyFileSync(srcHtml, destHtml);

console.log('✓ Build locked completed successfully');
