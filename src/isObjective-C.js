const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function ObjectiveC_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Objective_C = ["Podfile", "Podfile.lock"];
  let isObjective_C = isInclude(files, Objective_C);
  if (isObjective_C.length) {
      for (const file of isObjective_C) {
        if (file === "Podfile") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          for (let line of pkg) {
            line = line.trim();
            if (line.startsWith("pod")) {
              const dep = line.split(" ")[1].replace(/["',]/g, "");
              techstack_Set.add(dep);
            }
          }
        } else if (file === "Podfile.lock") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = yaml.load(pkg);
          const dependenciesArray = parsedFile?.["DEPENDENCIES"] || [];
          for (const dep of dependenciesArray) {
            techstack_Set.add(dep.split(" ")[0]);
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
  }