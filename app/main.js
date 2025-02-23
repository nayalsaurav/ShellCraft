// const readline = require("readline");
const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Uncomment this block to pass the first stage
// rl.question("$ ", (answer) => {
//   if (!isCommand(answer)) {
//     console.log(`${answer}: command not found\n`);
//   }
// });

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
}
startShell();

async function executeCommand(input) {
  const args = input.trim().split(" ");
  const command = args[0];
  if (!isCommand(command)) {
    console.log(`${command}: command not found`);
  }
  return true;
}
