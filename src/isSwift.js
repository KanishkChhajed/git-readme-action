const fs = require("fs");
const path = require("path");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Swift_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Swift = ["Package.swift", "Cartfile", "Podfile"];
  let isSwift = isInclude(files, Swift);

  if (isSwift.length) {
      for (const file of isSwift) {
        if (file === "Package.swift") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const packageRegex = /\.package\s*\(([\s\S]*?)\)/g;
          const urlRegex = /url:\s*["']([^"']+)["']/;
          const matches = pkg.matchAll(packageRegex);
          for (const match of matches) {
            const content = match[1];
            const urlMatch = content.match(urlRegex);
            if (urlMatch) {
              const dep = urlMatch[1].split("/");
              const depName = dep[dep.length - 1].replace(/\.git$/, "").split('@')[0].replace(/[^a-zA-Z0-9\-_]/g, '');
              techstack_Set.add(depName);
            }
          }
        } else if (file === "Cartfile") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          for (const line of pkg) {
            if (!line.trim() || line.trim().startsWith("#")) continue;
            const sep = line.trim().split(" ");
            if (sep.length < 2) continue;
            const dep = sep[1].split("/");
            const depName = dep[dep.length - 1].replace(/["']/g, "").trim();
            techstack_Set.add(depName);
          }
        } else if (file === "Podfile") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          for (const line of pkg) {
            const trimmed = line.trim();
            if (trimmed.startsWith("pod")) {
              const dep = trimmed.split(/\s+/);
              if (dep.length > 1) {
                const depName = dep[1].replace(/["',]/g, "").trim();
                techstack_Set.add(depName);
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