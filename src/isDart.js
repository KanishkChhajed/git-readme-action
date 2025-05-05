const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Dart_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  
  const Dart = ["pubspec.yaml", "pubspec.lock"];
  let isDart = isInclude(files, Dart);

  if (isDart.length) {
      for (const file of isDart) {
        if (file === "pubspec.yaml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          let parsedFile;
          try {
            // parsedFile = toml.parse(pkg);
            parsedFile = yaml.load(pkg);
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          const dependenciesArray = parsedFile?.["dependencies"] || {};
          const devDependencyArray = parsedFile?.["dev_dependencies"] || {};
          for (const dep of Object.keys(dependenciesArray)) {
            techstack_Set.add(dep);
          }
          for (const dep of Object.keys(devDependencyArray)) {
            techstack_Set.add(dep);
          }
        } else if (file === "pubspec.lock") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const parsedFile = yaml.load(pkg);
          const dependencyObject = parsedFile?.packages || {};
          for (const dep of Object.keys(dependencyObject)) {
            techstack_Set.add(dep);
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
  }