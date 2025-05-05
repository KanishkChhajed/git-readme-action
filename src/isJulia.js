const fs = require("fs");
const path = require("path");
const toml = require("toml");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Julia_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Julia = ["Project.toml", "Manifest.toml"];
  let isJulia = isInclude(files, Julia);

  if (isJulia.length) {
      for (const file of isJulia) {
        if (file === "Project.toml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = toml.parse(pkg);
          const dependencies = parsedFile?.["dependencies"] || {};
          for (const dep of Object.keys(dependencies)) {
            techstack_Set.add(dep);
          }
        } else if (file === "Manifest.toml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = toml.parse(pkg);
          const packages = parsedFile || {};
          for (const key in packages) {
            if (Array.isArray(packages[key])) {
              techstack_Set.add(key);
            }
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}