import { execSync } from 'child_process';
import os from 'os';

const url = 'http://localhost:3000?tc_preview_5b=1';
const platform = os.platform();

let command;

if (platform === 'darwin') {
  command = `open "${url}"`;
} else if (platform === 'win32') {
  command = `start "" "${url}"`;
} else {
  // Linux
  command = `xdg-open "${url}"`;
}

try {
  execSync(command, { stdio: 'inherit', shell: true });
} catch (error) {
  console.error(`Failed to open ${url}:`, error.message);
}
