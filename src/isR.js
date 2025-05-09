import fs from "fs";
import path from "path";


const R = ["DESCRIPTION", "renv.lock"];

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

async function R_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              try {
                      Pathstat = fs.statSync(Path);
                    } catch (err) {
                      console.warn(`Skipping file due to error: ${Path}, ${err.message}`);continue;
                    }
              // const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                if(file ==='workflows') continue
                const subDeps = await R_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(R.includes(file)){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,R)
            // console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in R_dir function`,err.message)
            return []
          }
}

export async function R_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  const check = await R_dir()
  // console.log(`Checks:${check}`)

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "DESCRIPTION") {
          // try{
          //   const pkg = fs.readFileSync(file, "utf-8").split("\n");
          //   const dependenciesArray = ["Depends","Imports","Suggests","LinkingTo",];
          //   for (let line of pkg) {
          //     line = line.trim();
          //     for (const dep of dependenciesArray) {
          //       if (line.startsWith(dep + ":")) {
          //         const depList = line.split(":")[1];
          //         const deps = depList.join(" ").map((d) => d.trim().split(",")[0]);
          //         for (const dep of deps) {
          //           if (dep && dep !== "R" && /^[a-zA-Z]/.test(dep)) techstack_Set.add(dep);
          //         }
          //       }
          //     }
          //     console.log(`Deps:${Array.from(techstack_Set)}`)
          //   }
          // }catch(err){
          //   console.error(`Error occured ${fileName}:`,err.message)
          // }
          try {
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
            const dependenciesArray = ["Depends", "Imports", "Suggests", "LinkingTo"];
            
            let currentDepField = null;
            let depLines = [];
        
            for (let line of pkg) {
              line = line.trim();
              if (!line) continue;
        
              // Match fields like "Depends:", "Imports:", etc.
              const match = line.match(/^([A-Za-z]+):\s*(.*)/);
              if (match) {
                const field = match[1];
                const rest = match[2];
        
                if (dependenciesArray.includes(field)) {
                  currentDepField = field;
                  depLines.push(rest);
                } else {
                  currentDepField = null;
                }
              } else if (currentDepField && dependenciesArray.includes(currentDepField)) {
                depLines.push(line); // continuation line
              }
            }
        
            // Process all collected dependency lines
            const depListStr = depLines.join(" ");
            const deps = depListStr
              .split(",")
              .map((d) => d.trim().split(" ")[0])
              .filter((dep) => dep && dep !== "R" && /^[a-zA-Z]/.test(dep));
        
            for (const dep of deps) {
              techstack_Set.add(dep);
            }
        
            // console.log("Deps:", Array.from(techstack_Set));
          } catch (err) {
            console.error(`Error occurred ${fileName}:`, err.message);
          }
        } else if (fileName === "renv.lock") {
          try{
            const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
            const dependenciesObject = pkg?.Packages || {};
            for (const dep of Object.keys(dependenciesObject)) {
              techstack_Set.add(dep);
            }
          }catch(err){
            console.error(`Error occured ${fileName}:`,err.message)
          }
        }else {
          techstack_Set.clear();
          console.log("No common package dependency file found....");
          return []
        }
      }
    }
    return Array.from(techstack_Set).filter(Boolean);
}