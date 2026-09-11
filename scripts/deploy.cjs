const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: rootDir, shell: true });
}

async function main() {
  const distDir = path.join(rootDir, 'dist');
  const tempDeployDir = path.join(os.tmpdir(), 'wtk-deploy-' + Date.now());

  try {
    // 1. Build
    console.log('--- Step 1: Building project ---');
    run('npm run build');

    // 2. Ensure 404.html
    const indexHtml = path.join(distDir, 'index.html');
    const notFoundHtml = path.join(distDir, '404.html');
    fs.copyFileSync(indexHtml, notFoundHtml);
    console.log('Copied 404.html for GitHub Pages SPA routing.');

    // 3. Copy dist to temp
    console.log('--- Step 2: Copying dist to temp folder ---');
    fs.cpSync(distDir, tempDeployDir, { recursive: true });

    // 4. Switch to gh-pages
    console.log('--- Step 3: Switching to gh-pages branch ---');
    run('git checkout gh-pages');

    // 5. Remove existing files in gh-pages except .git and node_modules
    console.log('--- Step 4: Cleaning gh-pages working directory ---');
    const items = fs.readdirSync(rootDir);
    for (const item of items) {
      if (item === '.git' || item === 'node_modules') continue;
      const fullPath = path.join(rootDir, item);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // 6. Copy from temp to repo root
    console.log('--- Step 5: Copying built files to gh-pages root ---');
    fs.cpSync(tempDeployDir, rootDir, { recursive: true });

    // 7. Commit & Push
    console.log('--- Step 6: Committing and pushing gh-pages ---');
    run('git add -A');
    try {
      run('git commit -m "deploy: update gh-pages production build"');
    } catch (e) {
      console.log('Nothing new to commit on gh-pages');
    }
    run('git push origin gh-pages');
    console.log('Successfully pushed to gh-pages branch!');
  } finally {
    // 8. Return to main branch
    console.log('--- Step 7: Returning to main branch ---');
    try {
      run('git checkout main');
    } catch (e) {
      console.error('Failed to checkout main:', e);
    }
    // Cleanup temp
    try {
      if (fs.existsSync(tempDeployDir)) {
        fs.rmSync(tempDeployDir, { recursive: true, force: true });
      }
    } catch (e) {}
  }
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
