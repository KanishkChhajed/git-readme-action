import  fs from "fs";
import  path from "path";
import toml from "toml";


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Python_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  const Python = [
    "requirements.txt",
    "pyproject.toml",
    "Pipfile",
    "poetry.lock",
    "setup.py",
  ];

  let isPython = isInclude(files, Python);
if (isPython.length) {
     for (const file of isPython) {
          if (file === "requirements.txt") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
            pkg.forEach((line) => {
              techstack_Set.add(line.split("==")[0].trim());
            });
          } else if (file === "pyproject.toml") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            // const parsedFile = toml.parse(pkg);
            let parsedFile;
            try {
              parsedFile = toml.parse(pkg);
            } catch (e) {
              console.error(`Error parsing ${file}: ${e.message}`);
              continue;
            }
            // const dependenciesObj = typeof parsedFile.tool?.poetry?.dependencies==='object' ? parsedFile.tool.poetry.dependencies : {};
            const dependenciesObj = parsedFile?.tool?.poetry?.dependencies || {};
            let dependenciesArray =   []
            if(typeof dependenciesObj === 'string'){
              dependenciesArray =  dependenciesObj.split("=")[0].trim()
            }else{
              dependenciesArray = Object.keys(dependenciesObj);
            }
              
            const devDependencyObj = parsedFile.tool?.poetry?.["dev-dependencies"]||{};
            let devDependencyArray =  []
            if(typeof devDependencyObj ==="string"){
              devDependencyArray = devDependencyObj.split("=")[0].trim()
            }else{
              devDependencyArray = Object.keys(devDependencyObj);
            }
            for (const dep of dependenciesArray) {
              techstack_Set.add(dep);
            }
            for (const dep of devDependencyArray) {
              techstack_Set.add(dep);
            }
          } else if (file === "Pipfile") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const parsedFile = toml.parse(pkg);
            const dependenciesArray =
              parsedFile?.["dev-packages"].split("=")[0].trim() || {};
            for (const dep of dependenciesArray) {
              techstack_Set.add(dep);
            }
          } else if (file === "poetry.lock") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const parsedFile = toml.parse(pkg);
            const dependenciesArray =
              parsedFile?.["package.dependencies"].split("=")[0].trim() || {};
            for (const dep of dependenciesArray) {
              techstack_Set.add(dep);
            }
          } else if (file === "setup.py") { 
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
            const match1 = pkg.match(/extras_require\s*=\s*\[([^\]]+)\]/);
            if (match) {
              const deps = match[1]
                .split(",")
                .map((dep) => dep.trim().replace(/['"]/g, ""))
                .filter(Boolean);
              deps.forEach((dep) => {
                techstack_Set.add(dep);
              });
            }
            if (match) {
              const deps = match[1]
                .split(",")
                .map((dep) => dep.trim().replace(/['"]/g, ""))
                .filter(Boolean);
              deps.forEach((dep) => {
                techstack_Set.add(dep);
              });
            }
            if (match1) {
              const deps = match1[1]
                .split(",")
                .map((dep) => dep.trim().replace(/['"]/g, ""))
                .filter(Boolean);
              deps.forEach((dep) => {
                techstack_Set.add(dep);
              });
            }
          }
        }
      }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}