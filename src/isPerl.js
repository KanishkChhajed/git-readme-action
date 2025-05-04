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

  const Perl = ["cpanfile", "Makefile.PL"];
  let isPerl = isInclude(files, Perl);

  if (isPerl.length) {
      for (const file of isPerl) {
        if (file === "cpanfile") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
          const perlRegex =
            /^\s*(requires|recommends|suggests)\s+['"]([^'"]+)['"]/;
          for (let line of pkg) {
            line = line.trim();
            if (line.startsWith("#") || line === "") continue;
            const match = line.match(perlRegex);
            if (match) {
              techstack_Set.add(match[2]);
            }
          }
        } else if (file === "Makefile.PL") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const perlRegex = /PREREQ_PM\s*=>\s*\{([\s\S]*?)\}/;
          const preDep = pkg.match(perlRegex);
          if (preDep) {
            const prereqBlock = preDep[1].split("\n");
            for (let line of prereqBlock) {
              line = line.trim();
              const lineRegex = /['"]([^'"]+)['"]\s*=>/;
              const match = line.match(lineRegex);
              if (match) {
                techstack_Set.add(match[1]);
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