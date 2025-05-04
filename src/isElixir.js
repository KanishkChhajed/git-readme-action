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

  const Elixir = ["mix.exs", "mix.lock"];
  let isElixir = isInclude(files, Elixir);

   if (isElixir.length) {
      for (const file of isElixir) {
        if (file === "mix.exs") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const depRegex = /{:\s*([a-zA-Z0-9_]+)\s*,/;
          for (let line of pkg) {
            line = line.trim();
            const match = line.match(depRegex);
            if (match) {
              techstack_Set.add(match[1]);
            }
          }
        } else if (file === "mix.lock") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const depRegex = /"([^"]+)"\s*=>/g;
          let match;
          while ((match = depRegex.exec(pkg)) !== null) {
            techstack_Set.add(match[1]);
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}