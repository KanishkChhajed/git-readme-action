import fs from "fs";
import path from "path";

const Swift = ["Package.swift", "Cartfile", "Podfile"];

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


async function Swift_dir(dir = process.cwd()){
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
                const subDeps = await Swift_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Swift.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Swift)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Kotlin_dir function`,err.message)
            return []
          }
}

export async function Swift_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isSwift = isInclude(files, Swift);

  const check = await Swift_dir()

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "Package.swift") {
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            const packageRegex = /\.package\s*\(([\s\S]*?)\)/g;
            const urlRegex = /url:\s*["']([^"']+)["']/;
            const matches = pkg.matchAll(packageRegex);
            for (const match of matches) {
              const content = match[1];
              const urlMatch = content.match(urlRegex);
              if (urlMatch) {
              const dep = urlMatch[1].split("/");
              const depName = dep[dep.length - 1].replace(/\.git$/, "").split('@')[0].replace(/[^a-zA-Z0-9\-_]/g, '');
              techstack_Set.add(depName);
            }
          }
        }catch(err){
          console.error(`Error occurred ${fileName}:`, err.message)
        }
        } else if (fileName === "Cartfile") {
          try{
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
            for (const line of pkg) {
              if (!line.trim() || line.trim().startsWith("#")) continue;
              const sep = line.trim().split(" ");
              if (sep.length < 2) continue;
              const dep = sep[1].split("/");
              const depName = dep[dep.length - 1].replace(/["']/g, "").trim();
              techstack_Set.add(depName);
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "Podfile") {
          try{
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
            for (const line of pkg) {
              const trimmed = line.trim();
              if (trimmed.startsWith("pod")) {
                const dep = trimmed.split(/\s+/);
                if (dep.length > 1) {
                  const depName = dep[1].replace(/["',]/g, "").trim();
                  techstack_Set.add(depName);
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
    return Array.from(techstack_Set).filter(Boolean);
}