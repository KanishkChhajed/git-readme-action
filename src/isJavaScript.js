import { execSync } from "child_process"
import fs from 'fs'
import path from 'path'

let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) =>
    allFiles.includes(path.basename(file))
  );
}

export async function JavaScript_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const JavaScript = [
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ];
  let isJavaScript = isInclude(files, JavaScript);

  for (const file of isJavaScript) {
    if (file === "package.json") {
      // const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
      let pkg;
      try {
        pkg = await JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
      } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
        continue;
      }
      let dependencyArray = Object.keys(pkg.dependencies || {});
      let devDependencyArray = Object.keys(pkg.devDependencies || {});
      for (const dep of dependencyArray) {
        techstack_Set.add(dep.split(":")[0]);
      }
      for (const dep of devDependencyArray) {
        techstack_Set.add(dep.split(":")[0]);
      }
    } else if (file === "package-lock.json") {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(workSpace, file), "utf-8")
      );
      const dependencies =
        pkg.dependencies || pkg.packages?.[""]?.dependencies || {};
      for (const dep of Object.keys(dependencies)) {
        techstack_Set.add(dep);
      }
    } else if (file === "yarn.lock") {
      const output = execSync(`yarn list`, {
        encoding: "utf-8",
        timeout: 5000,
      });
      const lines = output.trim().split("\n");
      for (const line of lines) {
        let parseLine;
        try {
          parseLine = JSON.parse(line);
        } catch (e) {
          console.error(`Error parsing ${file}: ${e.message}`);
          continue;
        }
        if (parseLine.type === "tree") {
          for (const dep of parseLine.data.trees) {
            const depName = dep.name.split("@")[0];
            techstack_Set.add(depName);
          }
        }
      }
    } else if (file === "pnpm-lock.yaml") {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(workSpace, file)),
        "utf-8"
      );
      let dependencyArray = Object.keys(pkg.dependencies || {});
      let devDependencyArray = Object.keys(pkg.devDependencies || {});
      for (const dep of dependencyArray) {
        techstack_Set.add(dep.split(":")[0]);
      }
      for (const dep of devDependencyArray) {
        techstack_Set.add(dep.split(":")[0]);
      }
    } else {
        console.log("No common package dependency file found....");
        return [];
    }
  }
  return Array.from(techstack_Set).filter(Boolean);
}
