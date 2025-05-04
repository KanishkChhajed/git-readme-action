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
  const Ruby = ["Gemfile", "Gemfile.lock"];
  let isRuby = isInclude(files, Ruby);
  if (isRuby.length) {
      for (const file of isRuby) {
        if (file === "Gemfile") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const gemRegex = /^\s*gem\s+['"]([^'"]+)['"]/gm;
          let match;
          while ((match = gemRegex.exec(pkg)) !== null) {
            techstack_Set.add(match[1]);
          }
        } else if (file === "Gemfile.lock") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          let inDependenciesSection = false;
          for (let line of pkg) {
            line = line.trim();
  
            if (line === "DEPENDENCIES") {
              inDependenciesSection = true;
              continue;
            }
            if (inDependenciesSection && line === "") {
              break;
            }
            if (inDependenciesSection && line) {
              const dep = line.split("(")[0].trim();
              if (dep && dep !== '') techstack_Set.add(dep);
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