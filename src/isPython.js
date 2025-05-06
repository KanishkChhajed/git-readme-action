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
            for(const line of pkg){
              const dep = line.trim()
              if(dep===''||dep.startsWith('#')) continue
              const depName = dep.split(/[=<>,' ']+/)
              techstack_Set.add(depName[0]);
            }

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
            // const dependenciesObj = parsedFile?.tool?.poetry?.dependencies || {};
            const dependenciesObj = parsedFile?.project?.dependencies || {};
            if(Array.isArray(dependenciesObj)){
              for (const dep of dependenciesObj) {
                const match = dep.match(/^([\w\-_.]+)/);
                if (match) {
                  techstack_Set.add(match[1]);
                }
              }
              // console.log("It's an array")
              // console.log(Array.from(techstack_Set))
            }else if(typeof dependenciesObj === "string"){
              for(const dep of dependenciesArray){
                let depName = dep.split(" ")[0].trim()
                depName = depName.match(/^([\w\-_.]+)/);
                if(depName.startsWith("#")) continue
                if (depName) {
                techstack_Set.add(depName[1]);
              }
              }
              // console.log("It's a string")
              // console.log(Array.from(techstack_Set))
            }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
              for (const dep of Object.keys(dependenciesObj)) {
                const match = dep.match(/^([\w\-_.]+)/);
                if (match) {
                  techstack_Set.add(match[1]);
                }
              }
              // console.log("It's an object")
              // console.log(Array.from(techstack_Set))
            }

            // for (const dep of dependenciesArray) {
            //   const match = dep.match(/^([\w\-_.]+)/);
            //   if (match) {
            //     techstack_Set.add(match[1]);
            //   }
            // }
            // let dependenciesArray =   []
            // if(typeof dependenciesObj === 'string'){
              // dependenciesArray =  dependenciesObj.split("=")[0].trim()
            // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
              // dependenciesArray = Object.keys(dependenciesObj);
            // }
              
            // const devDependencyObj = parsedFile.tool?.poetry?.["dev-dependencies"]||{};
            // let devDependencyArray =  []
            // if(typeof devDependencyObj ==="string"){
              // devDependencyArray = devDependencyObj.split("=")[0].trim()
            // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
              // devDependencyArray = Object.keys(devDependencyObj);
            // }
            // let splitRegex = /^([\w\-_.]+)/
            // for (const dep of Object.keys(dependenciesObj)){
              // const match = dep.match(splitRegex)
              // let depName = dep.split(' ')[0].trim()
              // depName = depName.replace(/(?=\s*(0-9|>|<|=|!|$|;))/g,'')
              // techstack_Set.add(match[0]);
            // }
            // for (const dep of Object.keys(devDependencyObj)) {
              // techstack_Set.add(dep);
            // }
          } else if (file === "Pipfile") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const parsedFile = toml.parse(pkg);
            const dependenciesArray = parsedFile?.["dev-packages"] || {};
            if(Array.isArray(dependenciesArray)){
              for (const dep of dependenciesArray) {
                if(dep.startsWith("#")) continue
                else{
                  const depName = dep.split("=")[0].trim()
                  techstack_Set.add(depName);
                }
              }
              console.log("It's an array")
              console.log(Array.from(techstack_Set))
            }else if (typeof dependenciesArray === 'object'&& dependenciesArray !== null){
              for (const dep of Object.keys(dependenciesArray)) {
                // const depName = dep.split("=")[0].trim()
                if(dep.startsWith("#") || dep === '') continue
                else{
                  const depName = dep.split(/[=<> ]+/)[0].trim()
                  techstack_Set.add(depName);
                }
              }
              console.log("It's an object")
              console.log(Array.from(techstack_Set))
            }else if(typeof dependenciesArray==='string'){
              const lines = dependenciesArray.split('\n')
              for(const line of lines){
                const dep = line.trim()
                if(dep === ''||dep.startsWith("#")) continue
                const depName = dep.split(/[=<> ]+/)[0].trim()
                techstack_Set.add(depName)
              }
              }
            console.log("It's a string")
            console.log(techstack_Set)
          } else if (file === "poetry.lock") {
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const parsedFile = toml.parse(pkg);
            const packages = parsedFile?.package || {};
            for(const pkgs of packages){
              const dependenciesObj = pkgs?.dependencies || {};
              if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
                for (const dep of Object.keys(dependenciesObj)) {
                  techstack_Set.add(dep);
                }
                console.log("It's an object")
                console.log(Array.from(techstack_Set))
              }else if(Array.isArray(dependenciesObj)){
                for(const dep of dependenciesObj){
                  techstack_Set.add(dep)
                }
                console.log("It's an array")
                console.log(techstack_Set)
              }else if(typeof dependenciesObj === "string"){
                techstack_Set.add(dependenciesObj)
                console.log("It's a string")
                console.log(Array.from(techstack_Set))
              }
            }
          } else if (file === "setup.py") { 
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
            const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
            const match1 = pkg.match(/extras_require\s*=\s*\[([^\]]+)\]/);
            if (match) {
              const deps = match[1]
                .split(",")
                .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/))
                .filter(Boolean);
              deps.forEach((dep) => {
                techstack_Set.add(dep);
              });
            }
            if (match) {
              const deps = match[1]
                .split(",")
                .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/))
                .filter(Boolean);
              deps.forEach((dep) => {
                techstack_Set.add(dep);
              });
            }
            if (match1) {
              const deps = match1[1]
                .split(",")
                .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/))
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