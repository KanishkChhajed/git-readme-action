const fs = require("fs");
const path = require("path");
const toml = require("toml");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Rust_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  const Rust = ["Cargo.toml", "Cargo.lock"];
  let isRust = isInclude(files, Rust);

   if (isRust.length) {
      for (const file of isRust) {
        if (file === "Cargo.toml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          let parsedFile;
          try {
            parsedFile = toml.parse(pkg);
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          const dependenciesObject = parsedFile?.["dependencies"] || {};
          const devDependencyObject = parsedFile?.["dev-dependencies"] || {};
          for (const dep of Object.keys(dependenciesObject)) {
            techstack_Set.add(dep);
          }
          for (const dep of Object.keys(devDependencyObject)) {
            techstack_Set.add(dep);
          }
        } else if (file === "Cargo.lock") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = toml.parse(pkg);
          const dependenciesArray = parsedFile?.["package"] || [];
          for (const pkgEntry of dependenciesArray) {
            const deps = pkgEntry?.["dependencies"] || [];
            for (const dep of deps) {
              techstack_Set.add(dep.split(" ")[0].trim());
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