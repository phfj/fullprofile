const { spawnSync } = require('child_process');
const readline = require('readline');

function runCommand(command, args) {
  const prettyArgs = args.map(arg => arg.includes(' ') ? `"${arg}"` : arg);
  console.log(`\nRunning: ${command} ${prettyArgs.join(' ')}`);
  
  // Only use shell: true on Windows for npm/npx resolving (since they are batch files).
  // git is an executable binary and using shell: false prevents quoting issues on Windows.
  const isWindows = process.platform === 'win32';
  const useShell = isWindows && command !== 'git';
  
  const result = spawnSync(command, args, { stdio: 'inherit', shell: useShell });
  
  if (result.status !== 0) {
    console.error(`Error: Command "${command} ${prettyArgs.join(' ')}" failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

async function main() {
  // 1. Sync database schema
  runCommand('npx', ['drizzle-kit', 'migrate']);

  // 2. Build the project
  runCommand('npm', ['run', 'build']);

  // 3. Stage all files
  runCommand('git', ['add', '.']);

  // Check if there are changes to commit
  const statusResult = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  const hasChanges = statusResult.stdout && statusResult.stdout.trim() !== '';

  if (hasChanges) {
    // 4. Commit changes
    let commitMessage = process.argv.slice(2).join(' ').trim();
    if (!commitMessage) {
      // If not provided in args, try to prompt the user
      if (process.stdin.isTTY) {
        commitMessage = await askQuestion('Enter commit message: ');
        commitMessage = commitMessage.trim();
      }
      // If still empty or not interactive, use default
      if (!commitMessage) {
        const date = new Date().toISOString();
        commitMessage = `Auto-deploy build: ${date}`;
      }
    }

    runCommand('git', ['commit', '-m', commitMessage]);
  } else {
    console.log('\nWorking tree clean. Nothing to commit.');
  }

  // 5. Push to main branch
  runCommand('git', ['push', 'origin', 'main']);

  console.log('\nDeployment completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
