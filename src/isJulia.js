import fs from "fs";
import path from "path";
import toml from "toml";


const Julia = ["Project.toml", "Manifest.toml"];

const  techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  try{
    return allFiles.filter((file) => dependencyPackage.includes(path.basename(file)));
  }catch{
    console.error(`Error in isInclude function:`, err.message);
    return [];
  }
}

async function Julia_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                if(file ==='workflows') continue
                const subDeps = await Julia_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Julia.includes(file)){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,Julia)
            return check;  
          }catch(err){
            console.error(`Error occured in ObjectiveC_dir function`,err.message)
            return []
          }
}

export async function Julia_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
try{

  const check = await Julia_dir();
  
  if (check && check.length) {
    for (const file of check) {
      const fileName = path.basename(file)
      if (fileName === "Project.toml") {
        let parsedFile
        try{
          const pkg = fs.readFileSync(file, "utf-8");
          parsedFile = toml.parse(pkg);
        }catch(err){
          console.error(`Error parsing ${file}: ${err.message}`)
        }
        try{
          const dependencies = parsedFile?.deps || {};
          for (const dep of Object.keys(dependencies)) {
            techstack_Set.add(dep);
          }
        }catch(err){
          console.error(`Error occured ${fileName}:`,err.message())
        }
      } else if (fileName === "Manifest.toml") {
        let parsedFile
        try{
          const pkg = fs.readFileSync(file, "utf-8");
           parsedFile = toml.parse(pkg);
        }catch(err){
          console.error(`Error parsing ${file}: ${err.message}`)
        }
        try{

          const packages = parsedFile || {};
          for (const key in packages) {
            if (Array.isArray(packages[key])) {
               techstack_Set.add(key);
            }else if(Object.keys(packages[key])){
              const dep = key?.deps || {}
              for(const dev of Object.keys(dep)){
                techstack_Set.add(dev)
              }
            }
          }
        }catch (err){
          console.error(`Error occured ${fileName}:`,err.message())
        }
      }else {
        techstack_Set.clear();
        console.log("No common package dependency file found....");
        return []
      }
    }
  }
  return Array.from(techstack_Set).filter(Boolean);
}catch (err){
  console.error(`Error occured:`,err.message)
}
}