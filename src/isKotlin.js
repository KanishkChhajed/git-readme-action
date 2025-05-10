import fs from "fs";
import path from "path";

const Kotlin = ["build.gradle", "build.gradle.kts"];

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


async function Kotlin_dir(dir = process.cwd()){
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
                const subDeps = await Kotlin_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Kotlin.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Kotlin)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Kotlin_dir function`,err.message)
            return []
          }
}

export async function Kotlin_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isKotlin = isInclude(files, Kotlin);
  const check = await Kotlin_dir()

  if (check && check.length) {
      for (const file of check){
      const fileName = path.basename(file)
        if (fileName === "build.gradle"){
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            const dependenciesRegex =
            /(implementation|api|compile|testImplementation|runtimeOnly|annotationProcessor)\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = dependenciesRegex.exec(pkg)) !== null) {
              const dep = match[2].split(":");
              if (dep.length >= 2) {
                techstack_Set.add(dep[1]);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "build.gradle.kts") {
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            const dependenciesRegex =
            /\b(?:implementation|api|compileOnly|runtimeOnly|testImplementation|annotationProcessor)\s*\(\s*["']([^"']+)["']\s*\)/g;
            let match;
            while ((match = dependenciesRegex.exec(pkg)) !== null) {
              const dep = match[1].split(":");
              if (dep.length >= 2) {
                techstack_Set.add(dep[1]);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        }
      }
    }else{
        techstack_Set.clear();
        console.log("No common package dependency file of Kotlin found....");
        return []
      }
    return Array.from(techstack_Set).filter(Boolean);
}