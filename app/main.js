const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let commands = [];
function isCommand(cmd) {
  return commands.includes(cmd);
}

async function startShell() {
  while (true) {
    const answer = await rl.question("$ ");
    const shouldContinue = await executeCommand(answer);
    if (!shouldContinue) break;
  }
  rl.close();
}
startShell();

async function executeCommand(input) {
  const args = input.trim().split(" ");
  const command = args[0];
  if (command === "exit" && args[1] == "0") return false;
  if (!isCommand(command)) {
    console.log(`${command}: command not found`);
  }
  return true;
}
