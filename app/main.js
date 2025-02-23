const readline = require("node:readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let commands = ["type", "echo", "exit"];
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
  else if (command === "echo") {
    const output = input.slice(4, input.length).trim();
    console.log(output);
  } else if (command === "type") {
    if (isCommand(args[1])) {
      console.log(`${args[1]} is a shell builtin`);
    } else {
      console.log(`${args[1]}: not found`);
    }
  } else {
    console.log(`${command}: command not found`);
  }
  return true;
}
