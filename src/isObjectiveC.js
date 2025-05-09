import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const Objective_C = ["Podfile", "Podfile.lock"];

const techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  try{
    return allFiles.filter((file) => dependencyPackage.includes(path.basename(file)));
  }catch(err){
    console.error(`Error in isInclude function:`, err.message);
      return [];
  }
}

async function ObjectiveC_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              let Pathstat
              try {
                      Pathstat = fs.statSync(Path);
                    } catch (err) {
                      console.warn(`Skipping file due to error: ${Path}, ${err.message}`);continue;
                    }
              // const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                if(file ==='.github' || file === '.git' || file === 'node_modules') continue
                const subDeps = await ObjectiveC_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Objective_C.includes(file)){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,Objective_C)
            return check;  
          }catch(err){
            console.error(`Error occured in ObjectiveC_dir function`,err.message)
            return []
          }
}


export async function ObjectiveC_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  try{
    const check = await ObjectiveC_dir()

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "Podfile") {
          let pkg
          try{
            pkg = fs.readFileSync(file, "utf-8").split("\n");
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`)
          }
          try{

            for (let line of pkg) {
              line = line.trim();
              if (line.startsWith("pod")) {
                const dep = line.split(" ")[1].replace(/["',]/g, "");
                techstack_Set.add(dep);
              }
            }
          }catch(err){
            console.error(`Error occured ${fileName}:`,err.message)
          }
        } else if (fileName === "Podfile.lock"){
          let parsedFile
          try{
           const pkg = fs.readFileSync(file, "utf-8");
            parsedFile = yaml.load(pkg);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`)
          }
          try{
            const dependenciesArray = parsedFile?.["DEPENDENCIES"] || [];
            for (const dep of dependenciesArray) {
              techstack_Set.add(dep.split(" ")[0]);
            }
          }catch(err){
            console.error(`Error occured ${fileName}:`,err.message)
          }
        }else {
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