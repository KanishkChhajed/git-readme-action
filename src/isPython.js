import  fs from "fs";
import  path from "path";
import toml from "toml";

const Python = [
  "requirements.txt",
  "pyproject.toml",
  "Pipfile",
  "poetry.lock",
  "setup.py",
];


const techstack_Set = new Set();

// const workSpace = process.env.GITHUB_WORKSPACE || process.cwd()

function isInclude(allFiles, dependencyPackage) {
  // try{
  //   const fileName  = []
  //   if (!allFiles || !dependencyPackage) return [];
  //   fileName.push(dependencyPackage.filter((file) =>
  //       allFiles.includes(path.basename(file))
  //     ));
  //     return fileName;
  // }catch (err){
  //   console.error(`Error in isInclude function:`,err.message)
  //   return []
  // }
  try {
    if (!allFiles || !dependencyPackage) return [];
    return allFiles.filter(filePath =>
      dependencyPackage.includes(path.basename(filePath))
    );
  } catch (err) {
    console.error(`Error in isInclude function:`, err.message);
    return [];
  }
}


export function Python_dependencies() {
  // const workSpace = process.env.GITHUB_WORKSPACE;
  // const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project
  // const Python = [
  //   "requirements.txt",
  //   "pyproject.toml",
  //   "Pipfile",
  //   "poetry.lock",
  //   "setup.py",
  // ];

  // let isPython = isInclude(files, Python);
  try{
  const check = Python_dir()
    if (check && check.length) {
      for (const file of check) {
        const fileName = path.basename(file)
          if (fileName === "requirements.txt") {
            try{
              const pkg = fs.readFileSync(file, "utf-8").split("\n");
              for(const line of pkg){
                const dep = line.trim()
                if(dep===''||dep.startsWith('#')) continue
                const depName = dep.split(/[=<>,' ']+/)[0]
                if(depName) techstack_Set.add(depName);
              }
            }catch(err){
              console.error(`Error occured ${fileName}:`,err.message())
            }
            
          } else if (fileName === "pyproject.toml") {
            try{

              const pkg = fs.readFileSync( file, "utf-8");
              // const parsedFile = toml.parse(pkg);
              let parsedFile;
              try {
                parsedFile = toml.parse(pkg);
              } catch (e) {
                console.error(`Error parsing ${file}: ${e.message}`);
                return;
              }
              // const dependenciesObj = typeof parsedFile.tool?.poetry?.dependencies==='object' ? parsedFile.tool.poetry.dependencies : {};
              // const dependenciesObj = parsedFile?.tool?.poetry?.dependencies || {};
              const dependenciesObj = parsedFile?.project?.dependencies ||parsedFile?.tool?.poetry?.dependencies || {};

              if(Array.isArray(dependenciesObj)){
                for (const dep of dependenciesObj) {
                  const match = dep.match(/^([\w\-_.]+)/);
                  if (match) {
                    techstack_Set.add(match[1]);
                  }
                }
                // console.log("It's an array")
                // console.log(Array.from(techstack_Set))
            }else if(typeof dependenciesObj === "string"){
              let line = dependenciesObj.split('\n')
              for(const dep of line){
                let depName = dep.split(" ")[0].trim()
                if(depName.startsWith("#")) continue
                depName = depName.match(/^([\w\-_.]+)/);
                if (depName) techstack_Set.add(depName[1]);
              }
              // console.log("It's a string")
              // console.log(Array.from(techstack_Set))
            }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
              for (const dep of Object.keys(dependenciesObj)) {
                const match = dep.match(/^([\w\-_.]+)/);
                if (match) techstack_Set.add(match[1]);
              }
              // console.log("It's an object")
              // console.log(Array.from(techstack_Set))
            }
            
            // for (const dep of dependenciesArray) {
              //   const match = dep.match(/^([\w\-_.]+)/);
              //   if (match) {
                //     techstack_Set.add(match[1]);
                //   }
                // }
                // let dependenciesArray =   []
                // if(typeof dependenciesObj === 'string'){
                  // dependenciesArray =  dependenciesObj.split("=")[0].trim()
                  // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
                    // dependenciesArray = Object.keys(dependenciesObj);
                    // }
                    
                    // const devDependencyObj = parsedFile.tool?.poetry?.["dev-dependencies"]||{};
                    // let devDependencyArray =  []
                    // if(typeof devDependencyObj ==="string"){
                      // devDependencyArray = devDependencyObj.split("=")[0].trim()
                      // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
                        // devDependencyArray = Object.keys(devDependencyObj);
                        // }
                        // let splitRegex = /^([\w\-_.]+)/
                        // for (const dep of Object.keys(dependenciesObj)){
                          // const match = dep.match(splitRegex)
                          // let depName = dep.split(' ')[0].trim()
                          // depName = depName.replace(/(?=\s*(0-9|>|<|=|!|$|;))/g,'')
                          // techstack_Set.add(match[0]);
                          // }
                          // for (const dep of Object.keys(devDependencyObj)) {
                            // techstack_Set.add(dep);
                          }catch(err){
                            console.error(`Error occured ${fileName}:`,err.message())
                          }
              // }
            } else if (fileName === "Pipfile") {
              try{

                const pkg = fs.readFileSync(file, "utf-8");
                let parsedFile
                try{
                  parsedFile = toml.parse(pkg);
                  
                }catch(err){
                  console.error(`Error occured in parsing ${file}:${err.message}`)
                  return;
                } 
                const dependenciesArray = parsedFile?.packages || {};
                const devDependenciesArray = parsedFile?.["dev-packages"] || {};
                if(Array.isArray(dependenciesArray)){
                  for (const dep of dependenciesArray) {
                    if(dep.startsWith("#")) continue
                    else{
                      const depName = dep.split("=")[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an array")
                  console.log(Array.from(techstack_Set))
                }else if (typeof dependenciesArray === 'object'&& dependenciesArray !== null){
                  for (const dep of Object.keys(dependenciesArray)) {
                    // const depName = dep.split("=")[0].trim()
                    if(dep.startsWith("#") || dep === '') continue
                    else{
                      const depName = dep.split(/[=<> ]+/)[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an object")
                  console.log(Array.from(techstack_Set))
                }else if(typeof dependenciesArray==='string'){
                  const lines = dependenciesArray.split('\n')
                  for(const line of lines){
                    const dep = line.trim()
                    if(dep === ''||dep.startsWith("#")) continue
                    const depName = dep.split(/[=<> ]+/)[0].trim()
                    techstack_Set.add(depName)
                  }
                }
                console.log("It's a string")
                console.log(techstack_Set)


                if(Array.isArray(devDependenciesArray)){
                  for (const dep of devDependenciesArray) {
                    if(dep.startsWith("#")) continue
                    else{
                      const depName = dep.split("=")[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an array")
                  console.log(Array.from(techstack_Set))
                }else if (typeof devDependenciesArray === 'object'&& devDependenciesArray !== null){
                  for (const dep of Object.keys(devDependenciesArray)) {
                    // const depName = dep.split("=")[0].trim()
                    if(dep.startsWith("#") || dep === '') continue
                    else{
                      const depName = dep.split(/[=<> ]+/)[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an object")
                  console.log(Array.from(techstack_Set))
                }else if(typeof devDependenciesArray==='string'){
                  const lines = devDependenciesArray.split('\n')
                  for(const line of lines){
                    const dep = line.trim()
                    if(dep === ''||dep.startsWith("#")) continue
                    const depName = dep.split(/[=<> ]+/)[0].trim()
                    techstack_Set.add(depName)
                  }
                }
                console.log("It's a string")
                console.log(techstack_Set)
              }catch(err){
                console.error(`Error occured ${fileName}:`,err.message())
              }
          } else if (fileName === "poetry.lock") {
            try{
              const pkg = fs.readFileSync(file, "utf-8");
              let parsedFile
              try{
                 parsedFile = toml.parse(pkg);
              }catch(err){
                console.error(`Error occured in parsing ${file}:${err.message}`)
                  return;
              }
              const packages = parsedFile?.package || [];
              if(Array.isArray(packages)){

                for(const pkgs of packages){
                  if(pkgs.name) techstack_Set.add(pkgs.name)
                  const dependenciesObj = pkgs?.dependencies || {};
                //   if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
                //     for (const dep of Object.keys(dependenciesObj)) {
                //       techstack_Set.add(dep);
                //     }
                //     console.log("It's an object")
                //     console.log(Array.from(techstack_Set))
                //   }else if(Array.isArray(dependenciesObj)){
                //     for(const dep of dependenciesObj){
                //       techstack_Set.add(dep)
                //     }
                //   console.log("It's an array")
                //   console.log(techstack_Set)
                // }else if(typeof dependenciesObj === "string"){
                //   techstack_Set.add(dependenciesObj)
                //   console.log("It's a string")
                //   console.log(Array.from(techstack_Set))
                // }

                if(Array.isArray(dependenciesObj)){
                  for (const dep of dependenciesObj) {
                    if(dep.startsWith("#")) continue
                    else{
                      const depName = dep.split("=")[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an array")
                  console.log(Array.from(techstack_Set))
                }else if (typeof dependenciesObj === 'object'&& dependenciesObj !== null){
                  for (const dep of Object.keys(dependenciesObj)) {
                    // const depName = dep.split("=")[0].trim()
                    if(dep.startsWith("#") || dep === '') continue
                    else{
                      const depName = dep.split(/[=<> ]+/)[0].trim()
                      techstack_Set.add(depName);
                    }
                  }
                  console.log("It's an object")
                  console.log(Array.from(techstack_Set))
                }else if(typeof dependenciesObj==='string'){
                  const lines = dependenciesObj.split('\n')
                  for(const line of lines){
                    const dep = line.trim()
                    if(dep === ''||dep.startsWith("#")) continue
                    const depName = dep.split(/[=<> ]+/)[0].trim()
                    techstack_Set.add(depName)
                  }
                }
                console.log("It's a string")
                console.log(techstack_Set)
              }
            }
            }catch(err){
              console.error(`Error occured ${fileName}:`,err.message())
            }
          } else if (fileName === "setup.py") {
            try{
              const pkg = fs.readFileSync(file, "utf-8");
              const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
              const match1 = pkg.match(/extras_require\s*=\s*\{([^}]+)\}/m);
              if (match) {
                // const deps = match[1].split(",").map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1]).filter(Boolean);
                // deps.forEach((dep) => {
                //   techstack_Set.add(dep);
                // });
                const deps = match[1].split(',').map(dep =>{
                  dep = dep.trim()
                  const match = dep.match(/['"]([^'"]+)['"]/)
                  if(match) return match[1].split(/[<>=!~;]/)[0].trim()
                    return null
                }).filter(Boolean)
                deps.forEach(dep => techstack_Set.add(dep))
              }
              // if (match) {
                //   const deps = match[1]
                //     .split(",")
                //     .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
                //     .filter(Boolean);
                //   deps.forEach((dep) => {
                  //     techstack_Set.add(dep);
                  //   });
                  // }
                  if (match1) {
                    // const deps = match1[1]
                    // .split(",")
                    // .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
                    // .filter(Boolean);
                    // deps.forEach((dep) => {
                    //   techstack_Set.add(dep);
                    // });
                    const deps = match1[1].split(',').map(dep =>{
                      dep = dep.trim()
                      const match = dep.match(/['"]([^'"]+)['"]/)
                      if(match) return match[1].split(/[<>=!~;]/)[0].trim()
                        return null
                    }).filter(Boolean)
                    deps.forEach(dep => techstack_Set.add(dep))
                  }
                }catch(err){
                  console.error(`Error occured ${fileName}:`,err.message())
                }
              }
              else {
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


    function Python_dir(dir = process.cwd()){
          // const dir = process.cwd()
           try{
            const folder = fs.readdirSync(dir)
            const allFiles = []
            for(const file of folder){
              const Path = path.join(dir,file)
              const Pathstat = fs.statSync(Path)
              if(Pathstat.isDirectory()){
                const subDeps = Python_dir(Path)
                if (Array.isArray(subDeps)) {
                  allFiles.push(...subDeps)
                }
                // console.log(`Successfully recursion on path:${Path}`)
              }else if(Pathstat.isFile()){
                allFiles.push(Path)
                // console.log(`Successfully push path on allFiles:${Path}`)
              } 
            }
            const check =  isInclude(allFiles,Python)
            return check;  
          }catch(err){
            console.error(`Error occured in Python_dir function`,err.message)
            return []
          }
}

