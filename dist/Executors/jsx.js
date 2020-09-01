"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const puppeteer_1 = __importDefault(require("puppeteer"));
const npm_1 = require("../utils/npm");
const JSXExecutor = async (code, index, path, options) => {
    console.log("started jsx");
    // create a random number to use as a filename for the file to be saved to /tmp and ran from
    const randomFileName = Math.floor(Math.random() * 100000000);
    const TempFolderDir = `/tmp/${randomFileName}`;
    const TempCodeFile = TempFolderDir + "/app.jsx";
    // create the folder and write the file so it can be ran
    await fs_1.promises.mkdir(TempFolderDir);
    await fs_1.promises.writeFile(TempCodeFile, code);
    console.log("written code file");
    await npm_1.createPackageJson(TempFolderDir);
    await npm_1.addScript({ start: "parcel index.html" }, TempFolderDir);
    await npm_1.installDependency("react", TempFolderDir);
    await npm_1.installDependency("react-dom", TempFolderDir);
    await npm_1.installDependency("parcel-bundler", TempFolderDir);
    if (options === null || options === void 0 ? void 0 : options.dependencies) {
        await npm_1.installDependencies(options.dependencies, TempFolderDir);
    }
    console.log("installed dependencies");
    const html = `
    <style>
      body {
        width: fit-content;
        height: fit-content;
      }
    </style>
    <div id="app"></div>
    <script src="index.js"></script>
  `;
    const js = `
    import React from "react"
    import { render } from "react-dom"
    import App from "./app"
    
    render(<App />, document.getElementById("app"))
  `;
    await fs_1.promises.writeFile(TempFolderDir + "/index.html", html);
    await fs_1.promises.writeFile(TempFolderDir + "/index.js", js);
    console.log("write supporting files");
    return new Promise((resolve, reject) => {
        console.log("returning promise");
        // run the process using the runtime and the file of code
        const JSXChildProcess = child_process_1.spawn("npm", ["start"], {
            cwd: TempFolderDir,
        });
        console.log("spawning process");
        let port;
        let error = false;
        // start the output with <!-- --> so the image can be replaced later if needed
        let output = "\n<!-- markdown-code-runner image-start -->\n";
        // take the output from the process and add it to the output string
        JSXChildProcess.stdout.on("data", async (data) => {
            data = data.toString();
            console.log(data);
            if (data.includes("localhost")) {
                port = data.split("localhost:")[1].split(/[\n ]/)[0];
                console.log("got port");
            }
            if (data.includes("Built")) {
                try {
                    const newPath = path.slice(0, -3) + "." + index + ".png";
                    await captureWebPageScreenShot(port, newPath);
                    console.log("captured screenshot");
                    output += `\n![rendered jsx](./${newPath.split("/").pop()})\n`;
                }
                catch (error) {
                    output += "\n```\n" + error + "\n```\n";
                    console.error(error);
                }
                console.log("exiting");
                JSXChildProcess.kill("SIGTERM");
            }
        });
        // same for errors, if the process errors it will still be written to the markdown so consumers of whatever thing this github action is being used on will know if the example code is broken
        JSXChildProcess.stderr.on("data", (data) => {
            console.log(data.toString());
            output += data.toString();
            error = true;
        });
        // wait for the process to exit, either successfully or with an error code
        JSXChildProcess.on("exit", (code) => {
            console.log("process exited");
            // exit code 0 means the process didn't error
            if (code === 0 || code === null) {
                console.log(" ✔️", TempFolderDir, "finished successfully");
            }
            else {
                console.warn(" ❌", TempFolderDir, "failed with error code", code);
            }
            // add ``` and a newline to the end of the output for the markdown
            output += "\n<!-- markdown-code-runner image-end -->\n";
            // remove the temp folder
            fs_1.promises.rmdir(TempFolderDir, { recursive: true });
            if (error) {
                reject(output);
            }
            else {
                resolve(output);
            }
        });
    });
};
const captureWebPageScreenShot = async (port, TempFile) => {
    try {
        const browser = await puppeteer_1.default.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle0" });
        console.log("loaded page");
        // const dimensions = await page.evaluate(() => {
        //   return {
        //     // plus 16 for the 8px margin from the body tag
        //     width: document.getElementById("app").offsetWidth + 16,
        //     height: document.getElementById("app").offsetHeight + 16,
        //   };
        // });
        await page.screenshot({
            path: TempFile,
            // clip: { x: 0, y: 0, ...dimensions },
            clip: { x: 0, y: 0, width: 300, height: 300 },
            omitBackground: true
        });
        console.log("screenshoted");
        await browser.close();
        console.log("closed browser");
        return true;
    }
    catch (error) {
        throw new Error(`failed to screenshot, error: ${error}`);
    }
};
exports.default = JSXExecutor;
