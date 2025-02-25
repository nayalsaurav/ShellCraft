const readline = require("node:readline/promises");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("child_process");
const os = require("os");
const { inherits } = require("node:util");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = ["type", "echo", "exit", "pwd"];

function isBuiltin(cmd) {
  return builtins.includes(cmd);
}

function parseString(args) {
  const fullCommand = args.join(" ");
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
  const parsedString = parseString(args).slice(1).join(" ");
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
  await handleExternalCommand(args);
  return true;
}

function handleExternalCommand(args) {
  args = parseString(args);

  // Find redirection symbol
  const idx = args.findIndex((arg) => arg === ">" || arg === "1>");

  if (idx !== -1 && idx + 1 < args.length) {
    const command = args.slice(0, idx);
    const filePath = args[idx + 1];

    return new Promise((resolve) => {
      const child = spawn(command[0], command.slice(1), {
        stdio: ["ignore", fs.openSync(filePath, "w"), "inherit"],
      });
      child.on("error", () => {
        console.log(`${command.slice(2)}: No such file or directory`);
        resolve(true);
      });

      child.on("close", (code) => {
        resolve(true);
      });
    });
  }

  return new Promise((resolve) => {
    const child = spawn(args[0], args.slice(1), {
      stdio: "inherit",
    });

    child.on("error", () => {
      console.log(`${args[0]}: command not found`);
      resolve(true);
    });

    child.on("close", (code) => {
      resolve(true);
    });
  });
}

async function executeCommand(input) {
  const args = input.trim().split(" ");
  const command = args[0];
  if (redirection(args) != -1) return await handleExternalCommand(args);
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
      return await handleExternalCommand(args);
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

function redirection(args) {
  const idx = args.findIndex((arg) => arg === ">" || arg === "1>");
  return idx;
}
