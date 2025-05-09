import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const Haskell = ["package.yaml", "stack.yaml", "cabal.project"];

const techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  try{

    return allFiles.filter((file) => dependencyPackage.includes(path.basename(file)));
  }catch (err){
    console.error(`Error in isInclude function:`, err.message);
    return [];
  }
}


async function Haskell_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                if(file ==='workflows') continue
                if(file ==='node_modules') continue
                const subDeps = await Haskell_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Haskell.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,Haskell)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Haskell_dir function`,err.message)
            return []
          }
}

export async function Haskell_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isHaskell = isInclude(files, Haskell);
  const check = await Haskell_dir()

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "package.yaml") {
          let parsedFile
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            parsedFile = yaml.load(pkg);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`)
          }
          try{
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
            console.log(`Deps: ${Array.from(techstack_Set)}`)
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "stack.yaml") {
          let parsedFile
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            parsedFile = yaml.load(pkg);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`)
          }
          try{
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
                typeof dep === "string" && dep.trim() !== "." &&
                (dep.endsWith(".cabal") || dep.endsWith("package.yaml"))
              ) {
                techstack_Set.add(dep);
              } else if (typeof dep === "string" && dep.trim() !== ".") {
                techstack_Set.add(dep);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "cabal.project") {
          try{
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
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
        }catch(err){
          console.error(`Error occurred ${fileName}:`, err.message)
        }
        }
      }
    }else {
        techstack_Set.clear();
        console.log("No common package dependency file found....");
        return []
      }
      console.log(`Deps: ${Array.from(techstack_Set)}`)
    return Array.from(techstack_Set).filter(Boolean);
}