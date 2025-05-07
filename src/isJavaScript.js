import { execSync } from "child_process"
import fs from 'fs'
import path from 'path'

const techstack_Set = new Set();

const JavaScript = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

function isInclude(allFiles, dependencyPackage) {
  try{

    if (!allFiles || !dependencyPackage) return [];
    return allFiles.filter((file) =>
      dependencyPackage.includes(path.basename(file))
  );
}catch(err){
  console.error(`Error in isInclude function:`, err.message);
    return [];
}
}


async function JavaScript_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                if(file ==='node_modules') continue
                const subDeps = await JavaScript_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(JavaScript.includes(file)){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,JavaScript)
            return check;  
          }catch(err){
            console.error(`Error occured in JavaScript_dir function`,err.message)
            return []
          }
}

export async function JavaScript_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  
  // let isJavaScript = isInclude(files, JavaScript);
  try{

    const check = await JavaScript_dir()
    
  if(check && check.length){
    
    for (const file of check) {
      const fileName = path.basename(file)
      if (fileName === "package.json") {
        // const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        let pkg;
        try {
          pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
        continue;
      }
      try{

        let dependencyArray = Object.keys(pkg.dependencies || {});
        let devDependencyArray = Object.keys(pkg.devDependencies || {});
        for (const dep of dependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      }catch(err){
        console.error(`Error occured ${fileName}:`,err.message())
      }
    } else if (fileName === "package-lock.json") {
      let pkg
      try{
        pkg = JSON.parse(
          fs.readFileSync(file, "utf-8")
        );
      }catch(err){
        console.error(`Error parsing ${file}: ${err.message}`)
      }
      try{

        const dependencies =
        pkg.dependencies || pkg.packages?.[""]?.dependencies || {};
        for (const dep of Object.keys(dependencies)) {
          techstack_Set.add(dep);
        }
      }catch(err){
        console.error(`Error occured ${fileName}:`,err.message())
      }
    } else if (fileName === "yarn.lock") {
      const originalDir = process.cwd()
      process.chdir(path.dirname(file))
      let output
      try{
        output = execSync(`yarn list --json`, {
          encoding: "utf-8",
          timeout: 5000,
        });
      }catch(err){
        console.error(`Error executing ${file}: ${err.message}`)
      }
      try{

        const lines = output.trim().split("\n");
        for (const line of lines) {
          let parseLine;
          try {
            parseLine = JSON.parse(line);
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          if (parseLine.type === "tree"&& parseLine.data && parseLine.data.trees) {
            for (const dep of parseLine.data.trees) {
              const depName = dep.name.split("@")[0];
              techstack_Set.add(depName);
            }
          }
        }
      }catch(err){
        console.error(`Error occured ${fileName}:`,err.message())
      }
    } else if (fileName === "pnpm-lock.yaml") {
      try{
        const originalDir = process.cwd();
        process.chdir(path.dirname(filePath));
        const output = execSync(`pnpm list --json`, {
            encoding: "utf-8",
            timeout: 10000,
          });
      let pkg
        pkg = JSON.parse(output);
      }catch(err){
        console.error(`Error parsing ${file}: ${err.message}`)
      }
      try{

        let dependencyArray = Object.keys(pkg.dependencies || {});
        let devDependencyArray = Object.keys(pkg.devDependencies || {});
        for (const dep of dependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      }catch(err){
        console.error(`Error occured ${fileName}:`,err.message())
      }
    }else{
      techstack_Set.clear();
      console.log("No common package dependency file found....");
      return [];
    }
  }
}
return Array.from(techstack_Set).filter(Boolean);
}catch(err){
  console.error(`Error occured:`,err.message)
}
}
