[![progress-banner](https://backend.codecrafters.io/progress/shell/7ebb0faa-938a-4609-b759-dac0b72c79d0)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

# Build Your Own Shell in JavaScript

This project is part of the [CodeCrafters "Build Your Own Shell" Challenge](https://app.codecrafters.io/courses/shell/overview). The goal is to create a minimal yet functional POSIX-compliant shell using JavaScript, implementing key features like command parsing, execution, built-in commands, and more.

---

## 🚀 Features Implemented

### ✅ **Base Features**

✔ Print a shell prompt (e.g., `$ `)  
✔ Handle invalid commands gracefully  
✔ Implement a **REPL** (Read-Eval-Print Loop)  
✔ Support the `exit` built-in command  
✔ Implement the `echo` built-in command  
✔ Implement the `type` built-in to check for built-ins and executables  
✔ Execute external programs

### ✅ **Extensions**

#### 📂 **File & Directory Management**

✔ Implement the `pwd` built-in command  
✔ Implement `cd` with absolute paths  
✔ Implement `cd` with relative paths  
✔ Implement `cd` to the home directory (`cd ~`)

#### 📝 **Quoting Support**

✔ Support for single quotes `'...'`  
✔ Support for double quotes `"..."`  
✔ Handle backslashes correctly inside and outside quotes  
✔ Execute quoted executables

#### 🔀 **Redirection**

✔ Redirect `stdout` using `>`  
✔ Redirect `stderr` using `2>`  
✔ Append to files using `>>` and `2>>`

#### 🔎 **Autocompletion**

✔ Built-in command completion  
✔ Argument-based completion  
✔ Executable completion

---

## 🛠 How to Run

### Prerequisites

- Ensure you have **Node.js 21+** installed.

### Run the Shell

```sh
./your_program.sh
```

or

```sh
node app/main.js
```

---

<!-- ## 🔄 Development Workflow

1. Make changes in `app/main.js`.
2. Test your implementation using the provided scripts.
3. Commit and push to submit your solution:
   ```sh
   git commit -am "Implemented [feature name]"
   git push origin master
   ```

---

## 📜 Roadmap

- [ ] Add support for environment variables (`$VAR`, `export VAR=value`)
- [ ] Implement pipes (`|`) to chain commands
- [ ] Improve error handling and messaging
- [ ] Support background execution (`command &`)

--- -->

## 📌 About CodeCrafters

This project is part of [CodeCrafters](https://codecrafters.io), a platform where developers build real-world systems from scratch, like shells, databases, and containers.

---

🔥 **Let's build a shell!** 🚀
