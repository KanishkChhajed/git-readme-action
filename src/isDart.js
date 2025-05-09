import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const Dart = ["pubspec.yaml", "pubspec.lock"];

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

async function Dart_dir(dir = process.cwd()){
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
                const subDeps = await Dart_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Dart.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Dart)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Elixir_dir function`,err.message)
            return []
          }
}


export async function Dart_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  
  // let isDart = isInclude(files, Dart);
  const check = await Dart_dir()

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "pubspec.yaml") {
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            let parsedFile;
            try {
              // parsedFile = toml.parse(pkg);
              parsedFile = yaml.load(pkg);
            } catch (e) {
              console.error(`Error parsing ${file}: ${e.message}`);
              continue;
            }
            const dependenciesArray = parsedFile?.["dependencies"] || {};
            const devDependencyArray = parsedFile?.["dev_dependencies"] || {};
            for (const dep of Object.keys(dependenciesArray)) {
              techstack_Set.add(dep);
            }
            for (const dep of Object.keys(devDependencyArray)) {
              techstack_Set.add(dep);
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "pubspec.lock") {
          let parsedFile
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            // const pkg = fs.readFileSync(file, "utf-8").split("\n");
            parsedFile = yaml.load(pkg);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
              continue;
          }
          try{
            const dependencyObject = parsedFile?.packages || {};
            for (const dep of Object.keys(dependencyObject)) {
              techstack_Set.add(dep);
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