const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function run(cmd, cwd = rootDir) {
  console.log(`> ${cmd} (in ${path.relative(rootDir, cwd) || '.'})`);
  execSync(cmd, { stdio: 'inherit', cwd, shell: 'powershell.exe' });
}

async function main() {
  // 1. Build
  console.log('--- Step 1: Building project ---');
  run('npm run build');

  // 2. Ensure 404.html for SPA
  const indexHtml = path.join(distDir, 'index.html');
  const notFoundHtml = path.join(distDir, '404.html');
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log('Copied 404.html for GitHub Pages SPA routing.');

  // 3. Get remote URL
  const remoteUrl = execSync('git remote get-url origin', { cwd: rootDir, encoding: 'utf8' }).trim();
  console.log(`Deploying to remote: ${remoteUrl}`);

  // 4. Initialize git inside dist and push to gh-pages branch
  console.log('--- Step 2: Preparing isolated dist repository ---');
  const distGit = path.join(distDir, '.git');
  if (fs.existsSync(distGit)) {
    fs.rmSync(distGit, { recursive: true, force: true });
  }

  run('git init', distDir);
  run('git config user.name "masterphum07-web"', distDir);
  run('git config user.email "masterphum07-web@users.noreply.github.com"', distDir);
  run(`git remote add origin ${remoteUrl}`, distDir);
  run('git checkout -B gh-pages', distDir);
  run('git add -A', distDir);
  run('git commit -m "deploy: update gh-pages production build"', distDir);

  console.log('--- Step 3: Pushing to gh-pages ---');
  run('git push --force origin gh-pages', distDir);

  // 5. Clean up .git in dist
  if (fs.existsSync(distGit)) {
    fs.rmSync(distGit, { recursive: true, force: true });
  }

  console.log('Successfully deployed to GitHub Pages (gh-pages branch)!');
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
