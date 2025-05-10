import fs from "fs";
import path from "path";
import toml from "toml";

const Rust = ["Cargo.toml", "Cargo.lock"];

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

async function Rust_dir(dir = process.cwd()){
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
                const subDeps = await Cpp_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Rust.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Rust)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Rust_dir function`,err.message)
            return []
          }
}

export async function Rust_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  // let isRust = isInclude(files, Rust);
  const check = Rust_dir()

   if (check && check.length) {
      for (const file of check){
        const fileName = path.basename(file)
        if (fileName === "Cargo.toml"){
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            let parsedFile;
            try {
              parsedFile = toml.parse(pkg);
            }catch (e) {
              console.error(`Error parsing ${file}: ${e.message}`);
              continue;
            }
            const dependenciesObject = parsedFile?.["dependencies"] || {};
            const devDependencyObject = parsedFile?.["dev-dependencies"] || {};
            for (const dep of Object.keys(dependenciesObject)) {
              techstack_Set.add(dep);
            }
            for (const dep of Object.keys(devDependencyObject)) {
              techstack_Set.add(dep);
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "Cargo.lock") {
          let parsedFile
          try{
            const pkg = fs.readFileSync(file, "utf-8");
            parsedFile = toml.parse(pkg);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
              continue;
          }
          try{
            const dependenciesArray = parsedFile?.["package"] || [];
            for (const pkgEntry of dependenciesArray) {
              const deps = pkgEntry?.["dependencies"] || [];
              for (const dep of deps) {
                techstack_Set.add(dep.split(" ")[0].trim());
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        }
      }
    }else {
        techstack_Set.clear();
        console.log("No common package dependency file of Rust found....");
        return []
      }
    return Array.from(techstack_Set).filter(Boolean);
}