"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as core from '@actions/core';
const github = __importStar(require("@actions/github"));
const index_1 = __importDefault(require("./index"));
const runAction = () => {
    // get the name of the repo this action is running in
    const fullRepo = github.context.payload.repository.full_name;
    const repo = fullRepo.split("/")[1];
    // only want to run the code in the repo this is being run on
    const repoDir = `/home/runner/work/${repo}/${repo}`;
    // all the markdown files in the repoDir
    const folders = `${repoDir}/**/*.md`;
    index_1.default(folders);
};
exports.default = runAction;