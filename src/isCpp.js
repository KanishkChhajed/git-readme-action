import fs from "fs";
import path from "path";

const Cpp = ["CMakeLists.txt", "vcpkg.json"];

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


async function Cpp_dir(dir = process.cwd()){
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
                if(Cpp.includes(file)){
                  allFiles.push(Path)
                }
                console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check = await isInclude(allFiles,Cpp)
            console.log(`Included Files: ${check}`)
            return check;  
          }catch(err){
            console.error(`Error occured in Kotlin_dir function`,err.message)
            return []
          }
}

export async function Cpp_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  // let isCpp = isInclude(files, Cpp);
  const check = await Cpp_dir()

  if (check && check.length) {
      for (const file of check) {
      const fileName = path.basename(file)
        if (fileName === "CMakeLists.txt"){
          try{
            const pkg = fs.readFileSync(file, "utf-8").split("\n");
            const findPackageRegex = /find_package\(\s*(?<package>[\w:\-_]+).*?\)/;
            const targetLinkLibrariesRegex =
            /target_link_libraries\([^)]*?\b(?<dependency>[\w:\-_]+)\b.*?\)/;
            for (const line of pkg) {
              const findPackageMatch = line.match(findPackageRegex);
              if (findPackageMatch?.groups?.package) {
                techstack_Set.add(findPackageMatch.groups.package);
              }
              const targetLinkLibrariesMatch = line.match(targetLinkLibrariesRegex);
              if (targetLinkLibrariesMatch?.groups?.dependency) {
                techstack_Set.add(targetLinkLibrariesMatch.groups.dependency);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        } else if (fileName === "vcpkg.json"){
          let pkg
          try{
            pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
          }catch(err){
            console.error(`Error parsing ${file}: ${err.message}`);
            continue;
          }
          try{
            const dependenciesArray = pkg.dependencies || [];
            for (const dep of dependenciesArray) {
              if (typeof dep === "string") {
                techstack_Set.add(dep);
              } else if (typeof dep === "object" && dep.name) {
                if (dep.name && dep.name.trim() !== '') techstack_Set.add(dep.name);
              }
            }
          }catch(err){
            console.error(`Error occurred ${fileName}:`, err.message)
          }
        }
      }
    }else {
        techstack_Set.clear();
        console.log("No common package dependency file of Cpp found....");
        return [];
      }
    return Array.from(techstack_Set).filter(Boolean);
}