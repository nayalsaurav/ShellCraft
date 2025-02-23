const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Uncomment this block to pass the first stage
let commands = [];
rl.question("$ ", (answer) => {
  if (!isCommand(answer)) {
    console.log(`${answer}: command not found\n`);
  } else rl.close();
});

function isCommand(cmd) {
  if (commands.includes(cmd)) return true;
  return false;
}
