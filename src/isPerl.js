import fs from "fs";
import  path from"path";


const Perl = ["cpanfile", "Makefile.PL"];

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

async function Perl_dir(dir = process.cwd()){
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
                if(file ==='node_modules') continue
                const subDeps = await Perl_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Perl.includes(file)){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,Perl)
            // console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Perl_dir function`,err.message)
            return []
          }
}


export async function Perl_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isPerl = isInclude(files, Perl);
  const check = await Perl_dir()

  if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
        if (fileName === "cpanfile") {
          try{
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
            const perlRegex =
            /^\s*(requires|recommends|suggests)\s+['"]([^'"]+)['"]/;
            for (let line of pkg) {
              line = line.trim();
              if (line.startsWith("#") || line === "") continue;
              const match = line.match(perlRegex);
              if (match && match[2]!='perl') {
                techstack_Set.add(match[2]);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message);
          }
        } else if (fileName === "Makefile.PL") {
          try {
            const pkg = fs.readFileSync(file, "utf-8");
        
            // Step 1: Find where PREREQ_PM block starts
            const lines = pkg.split('\n');
            let isInBlock = false;
            let blockLines = [];
        
            for (let line of lines) {
              line = line.trim();
        
              if (line.startsWith("'PREREQ_PM'") && line.includes('{')) {
                isInBlock = true;
                continue;
              }
        
              if (isInBlock) {
                if (line.startsWith('},') || line.startsWith('}')) {
                  isInBlock = false;
                  break;
                }
        
                blockLines.push(line);
              }
            }
        
            // Step 2: Extract dependencies from block
            for (let depLine of blockLines) {
              const match = depLine.match(/['"]([^'"]+)['"]\s*=>/);
              if (match) {
                techstack_Set.add(match[1]);
              }
            }
        
            // console.log(`Deps: ${Array.from(techstack_Set)}`);
          } catch (err) {
            console.error(`Error occurred ${fileName}:`, err.message);
          }
          }else {
        techstack_Set.clear();
        console.log("No common package dependency file found....");
        return []
      }
    }
    }else {
      techstack_Set.clear();
      console.log("No common package dependency file found....");
      return []
    }
    return Array.from(techstack_Set).filter(Boolean);
}