import fs from "fs";
import path from "path";

const Elixir = ["mix.exs", "mix.lock"];

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


async function Elixir_dir(dir = process.cwd()){
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
                const subDeps = await Elixir_dir(Path)
                  allFiles.push(...subDeps)
                console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Elixir.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Elixir)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Elixir_dir function`,err.message)
            return []
          }
}


export async function Elixir_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isElixir = isInclude(files, Elixir);
  const check = await Elixir_dir()

   if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "mix.exs"){
          try{
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
            const depRegex = /{:\s*([a-zA-Z0-9_]+)\s*,/;
            for (let line of pkg) {
              line = line.trim();
              const match = line.match(depRegex);
              if (match) {
                techstack_Set.add(match[1]);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "mix.lock") {
          try{
            const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8").split("\n");
            const depRegex = /"([^"]+)"\s*=>/g;
            let match;
            while ((match = depRegex.exec(pkg)) !== null) {
              techstack_Set.add(match[1]);
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        }else{
        techstack_Set.clear();
        console.log("No common package dependency file found....");
        return []
      }
    }
    }else{
        techstack_Set.clear();
        console.log("No common package dependency file found....");
        return []
      }
    return Array.from(techstack_Set).filter(Boolean);
}