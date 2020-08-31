const { spawn } = require("child_process")
const runAction = require("./dist/githubAction")

const installDependenciesRunner = spawn("yarn")

// installDependenciesRunner.stdout.on("data", (data) => {
//   data = data.toString()
//   console.log(data)
// })

// installDependenciesRunner.stderr.on("data", (data) => {
//   data = data.toString()
//   console.log(data)
// })

installDependenciesRunner.on("close", (code) => {
  if (code === 0 || code === null ) {
    console.log("installed dependencies")
    runAction()
  } else {
    console.log("failed to install dependencies")
  }
})