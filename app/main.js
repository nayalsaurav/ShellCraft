const readline = require("node:readline/promises");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("child_process");
const os = require("os");
const { stdout } = require("node:process");
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
    // console.log(args.slice(1).join(" "));
    handleEchoCommand(args);
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
  } else if (command === "cat") {
    handleCatCommand(args);
  } else {
    const { present, fullPath } = findExecutable(command);
    if (present) {
      executeFile(command, args);
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
function splitCustom(str) {
  const regex = /'[^']*'|[^']+/g; // Matches quoted parts OR unquoted parts
  return str.match(regex) || [str]; // Returns array of matched parts
}
function handleEchoCommand(args) {
  const res = handleCommand(args);
  console.log(res);
}

function handleCommand(args) {
  const input = splitCustom(args.slice(1).join(" "));
  let res = "";
  for (let p of input) {
    if (p.startsWith("'") && p.endsWith("'")) {
      // Remove surrounding single quotes but keep internal spaces
      res += p.replaceAll("'", "");
    } else {
      // Trim and replace multiple spaces with a single space
      res += p.replace(/\s+/g, " ");
    }
  }
  return res;
}

function handleCatCommand(args) {
  const inputString = args.slice(1).join(" ");
  const regex = /'([^']*)'|\S+/g;
  const files = [];

  let match;
  while ((match = regex.exec(inputString)) !== null) {
    files.push(match[1] || match[0]); // Use quoted string content or unquoted word
  }
  // console.log(files);
  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf8");
      process.stdout.write(content);
    } catch (error) {
      console.log(`cat: ${file}: No such file or directory`);
    }
  });
}

function executeFile(command, args) {
  const child = spawn(command, args.slice(1), { stdio: "inherit" });
  child.on("close", (code) => {
    // console.log(`child process exited with code ${code}`);
  });
}
