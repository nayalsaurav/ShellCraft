const readline = require("node:readline/promises");
const path = require("node:path");
const fs = require("node:fs");
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
    checkBuiltinType(args[1]);
  } else {
    console.log(`${command}: command not found`);
  }
  return true;
}

function checkBuiltinType(cmd) {
  if (isCommand(cmd)) {
    console.log(`${cmd} is a shell builtin`);
    return;
  }

  const pathDirs = process.env.PATH.split(":");
  let present = false;
  let fullPath = "";

  for (const dir of pathDirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file === cmd) {
          fullPath = path.join(dir, file);
          present = true;
          break;
        }
      }
      if (present) break;
    } catch (error) {
      // Ignore errors
    }
  }

  if (present) {
    console.log(`${cmd} is ${fullPath}`);
  } else {
    console.log(`${cmd}: not found`);
  }
}
