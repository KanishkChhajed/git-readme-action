const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Fsharp_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const NET = [".csproj", "packages.config", "project.json"];
  let isNET = isInclude(files, NET);

  if (isNET.length) {
      for (const file of isNET) {
        if (file.endsWith(".csproj")) {
          const xmlString = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = new xml2js.Parser();
          const pkg = await parsedFile.parseStringPromise(xmlString);
          const dependenciesArray = pkg?.Project?.ItemGroup || [];
          for (const group of dependenciesArray) {
            const PackageReference = group?.PackageReference || [];
  
            for (const dep of PackageReference) {
              const depName = dep?.$?.Include;
              if (depName) techstack_Set.add(depName);
            }
          }
        } else if (file === "packages.config") {
          const xmlString = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = new xml2js.Parser();
          const pkg = await parsedFile.parseStringPromise(xmlString);
          const dependenciesArray = pkg?.packages?.package || [];
          for (const dep of dependenciesArray) {
            const depName = dep?.$?.id;
            if (depName) techstack_Set.add(depName);
          }
        } else if (file === "project.json") {
          const pkg = JSON.parse(fs.readFileSync(path.join(workSpace, file), "utf-8"));
          let dependencyArray = Object.keys(pkg.dependencies || {});
          for (const dep of dependencyArray) {
            techstack_Set.add(dep.trim());
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}