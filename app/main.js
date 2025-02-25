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

function parseQuotedString(args) {
  const fullCommand = args.slice(1).join(" ");
  const parts = [];
  let current = "";
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escapeNext = false;
  let doubleEscapeNext = false;
  const escapeSequences = ["\\", "$", '"', "\n"];
  // Parse character by character
  for (let i = 0; i < fullCommand.length; i++) {
    const char = fullCommand[i];
    if (escapeNext && !inSingleQuote && !inDoubleQuote) {
      current += char;
      escapeNext = false;
      continue;
    }
    if (doubleEscapeNext) {
      if (escapeSequences.includes(char)) {
        current += char;
      } else current += "\\" + char;
      doubleEscapeNext = false;
      continue;
    }

    if (char === "\\" && !inSingleQuote && !inDoubleQuote) {
      escapeNext = true;
      continue;
    }
    if (char === "\\" && inDoubleQuote) {
      doubleEscapeNext = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === " " && !inDoubleQuote && !inSingleQuote) {
      if (current) {
        parts.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  // Add the last part if there is one
  if (current) {
    parts.push(current);
  }
  return parts;
}

function findExecutable(cmd) {
  const pathDirs = process.env.PATH.split(":");

  for (const dir of pathDirs) {
    try {
      const files = fs.readdirSync(dir);
      if (files.includes(cmd)) {
        return {
          present: true,
          fullPath: path.join(dir, cmd),
        };
      }
    } catch (error) {
      // Ignore errors like permission denied
    }
  }

  return {
    present: false,
    fullPath: null,
  };
}

function handleExitCommand(args) {
  if (args[1] === "0") {
    return false;
  }
  return true;
}

function handleEchoCommand(args) {
  const parsedString = parseQuotedString(args).join(" ");
  // Join with single spaces and output
  console.log(parsedString);
  return true;
}

function handleTypeCommand(args) {
  const cmd = args[1];
  if (!cmd) {
    console.log("type: missing argument");
    return true;
  }

  if (isBuiltin(cmd)) {
    console.log(`${cmd} is a shell builtin`);
  } else {
    const { present, fullPath } = findExecutable(cmd);
    if (present) {
      console.log(`${cmd} is ${fullPath}`);
    } else {
      console.log(`${cmd}: not found`);
    }
  }
  return true;
}

function handlePwdCommand() {
  console.log(process.cwd());
  return true;
}

function handleCdCommand(args) {
  const dir = args[1].trim();
  try {
    if (dir === "~") {
      process.chdir(os.homedir());
    } else {
      process.chdir(dir);
    }
  } catch (error) {
    console.log(`cd: ${dir}: No such file or directory`);
  }
  return true;
}

async function handleCatCommand(args) {
  let files = parseQuotedString(args);
  await handleExternalCommand("cat", ["cat", ...files]);
  return true;
}

function handleExternalCommand(command, args) {
  const { present, fullPath } = findExecutable(command);
  if (present) {
    return new Promise((resolve) => {
      const child = spawn(command, args.slice(1), {
        stdio: "inherit",
      });

      child.on("close", (code) => {
        resolve(true);
      });
    });
  } else {
    console.log(`${command}: command not found`);
    return true;
  }
}

async function executeCommand(input) {
  const args = input.trim().split(" ");
  const command = args[0];
  // Command router
  switch (command) {
    case "exit":
      return handleExitCommand(args);
    case "echo":
      return handleEchoCommand(args);
    case "type":
      return handleTypeCommand(args);
    case "pwd":
      return handlePwdCommand();
    case "cd":
      return handleCdCommand(args);
    case "cat":
      return handleCatCommand(args);
    default:
      return await handleExternalCommand(command, args);
  }
}

async function startShell() {
  while (true) {
    const answer = await rl.question("$ ");
    const shouldContinue = await executeCommand(answer);
    if (!shouldContinue) break;
  }
  rl.close();
}
// Start the shell
startShell();
