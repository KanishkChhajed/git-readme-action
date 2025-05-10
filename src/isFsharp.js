import fs from "fs";
import path from "path";
import  xml2js from "xml2js";

const Fsharp = [".fsproj", "packages.config", "project.json"];

const  techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  try{
    return allFiles.filter((file) => dependencyPackage.some(ext => file.endsWith(ext)));
  }catch(err){
    console.error(`Error in isInclude function:`, err.message);
    return [];
  }
}


async function Fsharp_dir(dir = process.cwd()){
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
                const subDeps = await Fsharp_dir(Path)
                  allFiles.push(...subDeps)
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                if(Fsharp.some(ext => file.endsWith(ext))){
                  allFiles.push(Path)
                }
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Fsharp)
            // console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Fsharp_dir function`,err.message)
            return []
          }
}

export async function Fsharp_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isNET = isInclude(files, NET);
  const check = await Fsharp_dir()

  if (check && check.length) {
      for (const file of check){
        const fileName = path.basename(file)
        if (file.endsWith(".fsproj")) {
          let pkg
          try{
            const xmlString = fs.readFileSync(file, "utf-8");
            const parsedFile = new xml2js.Parser({ explicitArray: true });
            pkg = await parsedFile.parseStringPromise(xmlString);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
            continue;
          }
          try{

            const dependenciesArray = pkg?.Project?.ItemGroup || [];
            for (const group of dependenciesArray) {
              const PackageReference = group?.PackageReference || [];
              
              for (const dep of PackageReference) {
                const depName = dep?.$?.Include;
                if (depName) techstack_Set.add(depName);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "packages.config") {
          let pkg
          try{
            const xmlString = fs.readFileSync(file, "utf-8");
            const parsedFile = new xml2js.Parser();
            pkg = await parsedFile.parseStringPromise(xmlString);
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
            continue;
          }
          try{

            const dependenciesArray = pkg?.packages?.package || [];
            for (const dep of dependenciesArray) {
              const depName = dep?.$?.id;
              if (depName) techstack_Set.add(depName);
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "project.json") {
          let pkg
          try{
            pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
            continue;
          }
          try{

            let dependencyArray = Object.keys(pkg.dependencies || {});
            for (const dep of dependencyArray) {
              techstack_Set.add(dep.trim());
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        }
      }
    }else {
        techstack_Set.clear();
        console.log("No common package dependency file of Fsharp found....");
        return []
      }
    return Array.from(techstack_Set).filter(Boolean);
}