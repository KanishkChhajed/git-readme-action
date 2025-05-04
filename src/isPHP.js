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
  const PHP = ["composer.json", "composer.lock"];
  let isPHP = isInclude(files, PHP);
  if (isPHP.length) {
      for (const file of isPHP) {
        if (file === "composer.json") {
          let pkg;
          try {
            pkg = JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          const dependenciesArray = Object.keys(pkg.require) || {};
          const devDependencyArray = Object.keys(pkg?.["require-dev"]) || {};
          for (const dep of dependenciesArray) {
            techstack_Set.add(dep.split(":")[0]);
          }
          for (const dep of devDependencyArray) {
            techstack_Set.add(dep.split(":")[0]);
          }
        } else if (file === "composer.lock") {
          // const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          let pkg;
          try {
            pkg = JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          const dependenciesArray = Object.keys(pkg.require) || {};
          const devDependencyArray = Object.keys(pkg?.["require-dev"]) || {};
          for (const dep of dependenciesArray) {
            techstack_Set.add(dep.split(":")[0]);
          }
          for (const dep of devDependencyArray) {
            techstack_Set.add(dep.split(":")[0]);
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}