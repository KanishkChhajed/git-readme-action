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

  const Cpp = ["CMakeLists.txt", "vcpkg.json"];
  let isCpp = isInclude(files, Cpp);

  if (isCpp.length) {
      for (const file of isCpp) {
        if (file === "CMakeLists.txt") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const findPackageRegex = /find_package\(\s*(?<package>[\w:\-_]+).*?\)/;
          const targetLinkLibrariesRegex =
            /target_link_libraries\([^)]*?\b(?<dependency>[\w:\-_]+)\b.*?\)/;
          for (const line of pkg) {
            const findPackageMatch = line.match(findPackageRegex);
            if (findPackageMatch?.groups?.package) {
              techstack_Set.add(findPackageMatch.groups.package);
            }
            const targetLinkLibrariesMatch = line.match(targetLinkLibrariesRegex);
            if (targetLinkLibrariesMatch?.groups?.dependency) {
              techstack_Set.add(targetLinkLibrariesMatch.groups.dependency);
            }
          }
        } else if (file === "vcpkg.json") {
          const pkg = JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
          const dependenciesArray = pkg.dependencies || [];
          for (const dep of dependenciesArray) {
            if (typeof dep === "string") {
              techstack_Set.add(dep);
            } else if (typeof dep === "object" && dep.name) {
              if (dep.name && dep.name.trim() !== '') techstack_Set.add(dep.name);
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