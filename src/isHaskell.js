const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Haskell_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Haskell = ["package.yaml", "stack.yaml", "cabal.project"];
  let isHaskell = isInclude(files, Haskell);

  if (isHaskell.length) {
      for (const file of isHaskell) {
        if (file === "package.yaml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = yaml.load(pkg);
          const dependenciesArray = parsedFile?.["dependencies"] || [];
          const subDependenciesArray = [
            "library",
            "executables",
            "tests",
            "benchmarks",
          ];
          for (const dep of dependenciesArray) {
            const depName = (typeof dep === "string" ? dep.split(" ")[0] : dep?.package || dep).toString().trim();
            techstack_Set.add(depName);
          }
          for (const subDep of subDependenciesArray) {
            const entity = parsedFile?.[subDep];
            if (!entity) continue;
            if (subDep === "library" && entity["dependencies"]) {
              for (const dep of entity["dependencies"]) {
                const depName =
                  typeof dep === "string"
                    ? dep.split(" ")[0]
                    : dep?.package || dep;
                techstack_Set.add(depName);
              }
            } else if (typeof entity === "object") {
              for (const comp of Object.values(entity)) {
                if (comp?.["dependencies"]) {
                  for (const dep of comp["dependencies"]) {
                    const depName =
                      typeof dep === "string"
                        ? dep.split(" ")[0]
                        : dep?.package || dep;
                    techstack_Set.add(depName);
                  }
                }
              }
            }
          }
        } else if (file === "stack.yaml") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = yaml.load(pkg);
          const extraDepsDependency = parsedFile?.["extra-deps"] || [];
          for (const dep of extraDepsDependency) {
            const depName =
              typeof dep === "string"
                ? dep.split(/[-@\/]/)[0]
                : dep?.package || dep;
            techstack_Set.add(depName);
          }
          const packagesDependency = parsedFile?.["packages"] || [];
          for (const dep of packagesDependency) {
            if (
              typeof dep === "string" &&
              (dep.endsWith(".cabal") || dep.endsWith("package.yaml"))
            ) {
              techstack_Set.add(dep);
            } else if (typeof dep === "string") {
              techstack_Set.add(dep);
            }
          }
        } else if (file === "cabal.project") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          let inPackageSection = false;
          for (const line of pkg) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("packages:")) {
              inPackageSection = true;
              const packageLine = trimmedLine
                .substring(trimmedLine.indexOf(":") + 1)
                .trim()
                .split(/\s+/);
              techstack_Set.add(packageLine);
            } else if (inPackageSection) {
              if (
                trimmedLine === "" ||
                trimmedLine.startsWith("--") ||
                trimmedLine.startsWith("#")
              ) {
                continue;
              } else if (
                trimmedLine.includes(":") &&
                !trimmedLine.startsWith("package")
              ) {
                inPackageSection = false;
              } else {
                const dep = trimmedLine.split(/\s+/);
                techstack_Set.add(dep);
              }
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