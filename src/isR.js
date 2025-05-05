const fs = require("fs");
const path = require("path");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function R_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  const R = ["DESCRIPTION", "renv.lock"];
  let isR = isInclude(files, R);

  if (isR.length) {
      for (const file of isR) {
        if (file === "DESCRIPTION") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const dependenciesArray = [
            "Depends",
            "Imports",
            "Suggests",
            "LinkingTo",
          ];
          for (let line of pkg) {
            line = line.trim();
            for (const dep of dependenciesArray) {
              if (line.startsWith(dep + ":")) {
                const depList = line.split(":")[1];
                const deps = depList
                  .split(",")
                  .map((d) => d.trim().split(" ")[0]);
                for (const dep of deps) {
                  if (dep && dep !== "R" && /^[a-zA-Z]/.test(dep)) techstack_Set.add(dep);
                }
              }
            }
          }
        } else if (file === "renv.lock") {
          const pkg = JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
          const dependenciesObject = pkg?.Packages || {};
          for (const dep of Object.keys(dependenciesObject)) {
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