const readline = require("node:readline/promises");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("child_process");
const os = require("os");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["type", "echo", "exit", "pwd"];

function isBuiltin(cmd) {
  return builtins.includes(cmd);
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

  if (command === "exit" && args[1] === "0") return false;
  else if (command === "echo") {
    console.log(args.slice(1).join(" "));
  } else if (command === "type") {
    const cmd = args[1];
    if (!cmd) {
      console.log("type: missing argument");
      return true;
    }
    if (isBuiltin(cmd)) {
      console.log(`${cmd} is a shell builtin`);
    } else {
      const { present, fullPath } = findExecutable(cmd);
      if (present) console.log(`${cmd} is ${fullPath}`);
      else console.log(`${cmd}: not found`);
    }
  } else if (command === "pwd") {
    console.log(process.cwd());
  } else if (command === "cd") {
    const dir = args[1].trim();
    try {
      if (dir === "~") {
        process.chdir(os.homedir());
      } else process.chdir(dir);
    } catch (error) {
      console.log(`cd: ${dir}: No such file or directory`);
    }
  } else {
    const { present, fullPath } = findExecutable(command);
    if (present) {
      const child = spawn(command, args.slice(1), {
        stdio: ["inherit", "pipe", "pipe"],
      });

      child.stdout.on("data", (data) => {
        process.stdout.write(data);
      });

      child.stderr.on("data", (data) => {
        process.stderr.write(data);
      });

      return new Promise((resolve) => {
        child.on("close", () => resolve(true));
      });
    } else {
      console.log(`${command}: command not found`);
    }
  }
  return true;
}

function findExecutable(cmd) {
  const pathDirs = process.env.PATH.split(":");
  for (const dir of pathDirs) {
    try {
      const files = fs.readdirSync(dir);
      if (files.includes(cmd)) {
        return { present: true, fullPath: path.join(dir, cmd) };
      }
    } catch (error) {
      // Ignore errors like permission denied
    }
  }
  return { present: false, fullPath: null };
}
