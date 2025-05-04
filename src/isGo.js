const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const toml = require("toml");
const xml2js = require("xml2js");
const yaml = require("js-yaml");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function detect_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Go = ["go.mod", "go.sum"];
  let isGo = isInclude(files, Go);

  if (isGo.length) {
      for (const file of isGo) {
        if (file === "go.mod") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          let inRequireBlock = false;
          for (let line of pkg) {
            line = line.trim();
            if (line.startsWith("require (")) {
              inRequireBlock = true;
              continue;
            }
            if (inRequireBlock && line === ")") {
              inRequireBlock = false;
              continue;
            }
            if (
              (inRequireBlock || line.startsWith("require ")) &&
              !line.startsWith("//")
            ) {
              let dep = line.replace("require", "").trim().split(" ")[0];
              dep = dep.split("/");
              let depName = dep[dep.length - 1];
              techstack_Set.add(depName);
            }
          }
        } else if (file === "go.sum") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          for (let dep of pkg) {
            dep = dep.split(" ")[0];
            dep = dep.split("/");
            let depName = dep[dep.length - 1];
            techstack_Set.add(depName);
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}