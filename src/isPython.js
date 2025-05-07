// import  fs from "fs";
// import  path from "path";
// import toml from "toml";

// const Python = [
//   "requirements.txt",
//   "pyproject.toml",
//   "Pipfile",
//   "poetry.lock",
//   "setup.py",
// ];


// const techstack_Set = new Set();

// // const workSpace = process.env.GITHUB_WORKSPACE || process.cwd()

// function isInclude(allFiles, dependencyPackage) {
//   // try{
//   //   const fileName  = []
//   //   if (!allFiles || !dependencyPackage) return [];
//   //   fileName.push(dependencyPackage.filter((file) =>
//   //       allFiles.includes(path.basename(file))
//   //     ));
//   //     return fileName;
//   // }catch (err){
//   //   console.error(`Error in isInclude function:`,err.message)
//   //   return []
//   // }
//   try {
//     if (!Array.isArray(allFiles) || !Array.isArray(dependencyPackage)) return [];
//     return allFiles.filter(filePath =>
//       dependencyPackage.includes(path.basename(filePath))
//     );
//   } catch (err) {
//     console.error(`Error in isInclude function:`, err.message);
//     return [];
//   }
// }


// export function Python_dependencies() {
//   // const workSpace = process.env.GITHUB_WORKSPACE;
//   // const files = fs.readdirSync(workSpace);
//   // const lang = process.env.GITHUB_L;

//   // Identify which language is used in the project
//   // const Python = [
//   //   "requirements.txt",
//   //   "pyproject.toml",
//   //   "Pipfile",
//   //   "poetry.lock",
//   //   "setup.py",
//   // ];

//   // let isPython = isInclude(files, Python);
//   const check = Python_dir()
//   try{
//     if (check && check.length) {
//       for (const file of check) {
//         const fileName = process.basename(file)
//           if (fileName === "requirements.txt") {
//             try{
//               const pkg = fs.readFileSync(file, "utf-8").split("\n");
//               for(const line of pkg){
//                 const dep = line.trim()
//                 if(dep===''||dep.startsWith('#')) continue
//                 const depName = dep.split(/[=<>,' ']+/)
//                 techstack_Set.add(depName[0]);
//               }
//             }catch(err){
//               console.error(`Error occured ${fileName}:`,err.message())
//             }
            
//           } else if (fileName === "pyproject.toml") {
//             try{

//               const pkg = fs.readFileSync( file, "utf-8");
//               // const parsedFile = toml.parse(pkg);
//               let parsedFile;
//               try {
//                 parsedFile = toml.parse(pkg);
//               } catch (e) {
//                 console.error(`Error parsing ${file}: ${e.message}`);
//                 continue;
//               }
//               // const dependenciesObj = typeof parsedFile.tool?.poetry?.dependencies==='object' ? parsedFile.tool.poetry.dependencies : {};
//               // const dependenciesObj = parsedFile?.tool?.poetry?.dependencies || {};
//               const dependenciesObj = parsedFile?.project?.dependencies ||parsedFile?.tool?.poetry?.dependencies || {};
//               if(Array.isArray(dependenciesObj)){
//                 for (const dep of dependenciesObj) {
//                   const match = dep.match(/^([\w\-_.]+)/);
//                   if (match) {
//                     techstack_Set.add(match[1]);
//                   }
//                 }
//                 // console.log("It's an array")
//                 // console.log(Array.from(techstack_Set))
//             }else if(typeof dependenciesObj === "string"){
//               let line = dependenciesObj.split('\n')
//               for(const dep of line){
//                 let depName = dep.split(" ")[0].trim()
//                 if(depName.startsWith("#")) continue
//                 depName = depName.match(/^([\w\-_.]+)/);
//                 if (depName) {
//                   techstack_Set.add(depName[1]);
//                 }
//               }
//               // console.log("It's a string")
//               // console.log(Array.from(techstack_Set))
//             }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//               for (const dep of Object.keys(dependenciesObj)) {
//                 const match = dep.match(/^([\w\-_.]+)/);
//                 if (match) {
//                   techstack_Set.add(match[1]);
//                 }
//               }
//               // console.log("It's an object")
//               // console.log(Array.from(techstack_Set))
//             }
            
//             // for (const dep of dependenciesArray) {
//               //   const match = dep.match(/^([\w\-_.]+)/);
//               //   if (match) {
//                 //     techstack_Set.add(match[1]);
//                 //   }
//                 // }
//                 // let dependenciesArray =   []
//                 // if(typeof dependenciesObj === 'string'){
//                   // dependenciesArray =  dependenciesObj.split("=")[0].trim()
//                   // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//                     // dependenciesArray = Object.keys(dependenciesObj);
//                     // }
                    
//                     // const devDependencyObj = parsedFile.tool?.poetry?.["dev-dependencies"]||{};
//                     // let devDependencyArray =  []
//                     // if(typeof devDependencyObj ==="string"){
//                       // devDependencyArray = devDependencyObj.split("=")[0].trim()
//                       // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//                         // devDependencyArray = Object.keys(devDependencyObj);
//                         // }
//                         // let splitRegex = /^([\w\-_.]+)/
//                         // for (const dep of Object.keys(dependenciesObj)){
//                           // const match = dep.match(splitRegex)
//                           // let depName = dep.split(' ')[0].trim()
//                           // depName = depName.replace(/(?=\s*(0-9|>|<|=|!|$|;))/g,'')
//                           // techstack_Set.add(match[0]);
//                           // }
//                           // for (const dep of Object.keys(devDependencyObj)) {
//                             // techstack_Set.add(dep);
//                           }catch(err){
//                             console.error(`Error occured ${fileName}:`,err.message())
//                           }
//               // }
//             } else if (fileName === "Pipfile") {
//               try{

//                 const pkg = fs.readFileSync(file, "utf-8");
//                 const parsedFile = toml.parse(pkg);
//                 const dependenciesArray = parsedFile?.["dev-packages"] || {};
//                 if(Array.isArray(dependenciesArray)){
//                   for (const dep of dependenciesArray) {
//                     if(dep.startsWith("#")) continue
//                     else{
//                       const depName = dep.split("=")[0].trim()
//                       techstack_Set.add(depName);
//                     }
//                   }
//                   console.log("It's an array")
//                   console.log(Array.from(techstack_Set))
//                 }else if (typeof dependenciesArray === 'object'&& dependenciesArray !== null){
//                   for (const dep of Object.keys(dependenciesArray)) {
//                     // const depName = dep.split("=")[0].trim()
//                     if(dep.startsWith("#") || dep === '') continue
//                     else{
//                       const depName = dep.split(/[=<> ]+/)[0].trim()
//                       techstack_Set.add(depName);
//                     }
//                   }
//                   console.log("It's an object")
//                   console.log(Array.from(techstack_Set))
//                 }else if(typeof dependenciesArray==='string'){
//                   const lines = dependenciesArray.split('\n')
//                   for(const line of lines){
//                     const dep = line.trim()
//                     if(dep === ''||dep.startsWith("#")) continue
//                     const depName = dep.split(/[=<> ]+/)[0].trim()
//                     techstack_Set.add(depName)
//                   }
//                 }
//                 console.log("It's a string")
//                 console.log(techstack_Set)
//               }catch(err){
//                 console.error(`Error occured ${fileName}:`,err.message())
//               }
//           } else if (fileName === "poetry.lock") {
//             try{
//               const pkg = fs.readFileSync(file, "utf-8");
//               const parsedFile = toml.parse(pkg);
//               const packages = parsedFile?.package || {};
//               for(const pkgs of packages){
//                 const dependenciesObj = pkgs?.dependencies || {};
//                 if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//                   for (const dep of Object.keys(dependenciesObj)) {
//                     techstack_Set.add(dep);
//                   }
//                   console.log("It's an object")
//                   console.log(Array.from(techstack_Set))
//                 }else if(Array.isArray(dependenciesObj)){
//                   for(const dep of dependenciesObj){
//                     techstack_Set.add(dep)
//                   }
//                   console.log("It's an array")
//                   console.log(techstack_Set)
//                 }else if(typeof dependenciesObj === "string"){
//                   techstack_Set.add(dependenciesObj)
//                   console.log("It's a string")
//                   console.log(Array.from(techstack_Set))
//                 }
//               }
//             }catch(err){
//               console.error(`Error occured ${fileName}:`,err.message())
//             }
//           } else if (fileName === "setup.py") {
//             try{
//               const pkg = fs.readFileSync(file, "utf-8");
//               const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
//               const match1 = pkg.match(/extras_require\s*=\s*\{([^}]+)\}/m);
//               if (match) {
//                 const deps = match[1].split(",").map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1]).filter(Boolean);
//                 deps.forEach((dep) => {
//                   techstack_Set.add(dep);
//                 });
//               }
//               // if (match) {
//                 //   const deps = match[1]
//                 //     .split(",")
//                 //     .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
//                 //     .filter(Boolean);
//                 //   deps.forEach((dep) => {
//                   //     techstack_Set.add(dep);
//                   //   });
//                   // }
//                   if (match1) {
//                     const deps = match1[1]
//                     .split(",")
//                     .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
//                     .filter(Boolean);
//                     deps.forEach((dep) => {
//                       techstack_Set.add(dep);
//                     });
//                   }
//                 }catch(err){
//                   console.error(`Error occured ${fileName}:`,err.message())
//                 }
//               }
//               else {
//                 techstack_Set.clear();
//               console.log("No common package dependency file found....");
//             }
//                 }
//               }
//             }catch (err){
//               console.error(`Error occured:`,err.message)
//             }
//             return Array.from(techstack_Set).filter(Boolean);
//     }


//     function Python_dir(dir = process.cwd()){
//           // const dir = process.cwd()
//            try{
//             const folder = fs.readdirSync(dir)
//             const allFiles = []
//             for(const file of folder){
//               const Path = path.join(dir,file)
//               const Pathstat = fs.statSync(Path)
//               if(Pathstat.isDirectory()){
//                 const subDeps = Python_dir(Path)
//                 if (Array.isArray(subDeps)) {
//                   allFiles.push(...subDeps)
//                 }
//                 console.log(`Successfully recursion on path:${Path}`)
//               }else if(Pathstat.isFile()){
//                 allFiles.push(Path)
//                 console.log(`Successfully push path on allFiles:${Path}`)
//               } 
//             }
//             const check =  isInclude(allFiles,Python)
//             return check;  
//           }catch(err){
//             console.error(`Error occured in Python_dir function`,err.message)
//             return []
//           }
// }

import fs from "fs";
import path from "path";
import toml from "toml";

// List of Python dependency files to look for
const Python = [
  "requirements.txt",
  "pyproject.toml",
  "Pipfile",
  "poetry.lock",
  "setup.py",
];

// Set to store unique dependencies
const techstack_Set = new Set();

/**
 * Find files that match the target dependency filenames
 * @param {string[]} allFiles - List of file paths
 * @param {string[]} dependencyPackage - List of target filenames
 * @returns {string[]} - Matching file paths
 */
function isInclude(allFiles, dependencyPackage) {
  try {
    if (!allFiles || !dependencyPackage) return [];
    // Filter files by checking if their basename is in the dependency list
    return allFiles.filter(filePath =>
      dependencyPackage.includes(path.basename(filePath))
    );
  } catch (err) {
    console.error(`Error in isInclude function:`, err.message);
    return [];
  }
}

/**
 * Main function to extract Python dependencies
 * @returns {string[]} - Array of unique dependencies
 */
export function Python_dependencies() {
  try {
    // Find Python dependency files
    const check = Python_dir();
    
    if (check && check.length) {
      // Process each found file
      for (const file of check) {
        const fileName = path.basename(file);
        
        if (fileName === "requirements.txt") {
          processRequirementsTxt(file);
        } else if (fileName === "pyproject.toml") {
          processPyprojectToml(file);
        } else if (fileName === "Pipfile") {
          processPipfile(file);
        } else if (fileName === "poetry.lock") {
          processPoetryLock(file);
        } else if (fileName === "setup.py") {
          processSetupPy(file);
        }
      }
      
      return Array.from(techstack_Set).filter(Boolean);
    } else {
      techstack_Set.clear();
      console.log("No common package dependency file found....");
      return [];
    }
  } catch (err) {
    console.error(`Error in Python_dependencies:`, err.message);
    return [];
  }
}

/**
 * Process requirements.txt file
 * @param {string} file - Path to requirements.txt
 */
function processRequirementsTxt(file) {
  try {
    const pkg = fs.readFileSync(file, "utf-8").split("\n");
    for (const line of pkg) {
      const dep = line.trim();
      if (dep === '' || dep.startsWith('#')) continue;
      const depName = dep.split(/[=<>,' ']+/)[0]; // More robust splitting
      if (depName) techstack_Set.add(depName);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

/**
 * Process pyproject.toml file
 * @param {string} file - Path to pyproject.toml
 */
function processPyprojectToml(file) {
  try {
    const pkg = fs.readFileSync(file, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(pkg);
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
      return;
    }
    
    // Try both project.dependencies (PEP 621) and tool.poetry.dependencies
    const dependenciesObj = parsedFile?.project?.dependencies ||
                           parsedFile?.tool?.poetry?.dependencies || 
                           {};
    
    if (Array.isArray(dependenciesObj)) {
      for (const dep of dependenciesObj) {
        const match = dep.match(/^([\w\-_.]+)/);
        if (match) {
          techstack_Set.add(match[1]);
        }
      }
    } else if (typeof dependenciesObj === "string") {
      let lines = dependenciesObj.split('\n');
      for (const dep of lines) {
        let depName = dep.split(" ")[0].trim();
        if (depName.startsWith("#")) continue;
        depName = depName.match(/^([\w\-_.]+)/);
        if (depName) {
          techstack_Set.add(depName[1]);
        }
      }
    } else if (typeof dependenciesObj === 'object' && dependenciesObj !== null) {
      for (const dep of Object.keys(dependenciesObj)) {
        const match = dep.match(/^([\w\-_.]+)/);
        if (match) {
          techstack_Set.add(match[1]);
        }
      }
    }
    
    // Also check dev dependencies if they exist
    const devDependencyObj = parsedFile?.tool?.poetry?.["dev-dependencies"] || {};
    if (typeof devDependencyObj === 'object' && devDependencyObj !== null) {
      for (const dep of Object.keys(devDependencyObj)) {
        techstack_Set.add(dep);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

/**
 * Process Pipfile
 * @param {string} file - Path to Pipfile
 */
function processPipfile(file) {
  try {
    const pkg = fs.readFileSync(file, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(pkg);
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
      return;
    }
    
    // Process both packages and dev-packages sections
    processPackageSection(parsedFile?.packages || {});
    processPackageSection(parsedFile?.["dev-packages"] || {});
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

/**
 * Helper to process a package section in Pipfile
 * @param {Object|Array|string} dependenciesArray - Package section
 */
function processPackageSection(dependenciesArray) {
  if (Array.isArray(dependenciesArray)) {
    for (const dep of dependenciesArray) {
      if (dep.startsWith("#")) continue;
      const depName = dep.split("=")[0].trim();
      techstack_Set.add(depName);
    }
  } else if (typeof dependenciesArray === 'object' && dependenciesArray !== null) {
    for (const dep of Object.keys(dependenciesArray)) {
      if (dep.startsWith("#") || dep === '') continue;
      const depName = dep.split(/[=<> ]+/)[0].trim();
      techstack_Set.add(depName);
    }
  } else if (typeof dependenciesArray === 'string') {
    const lines = dependenciesArray.split('\n');
    for (const line of lines) {
      const dep = line.trim();
      if (dep === '' || dep.startsWith("#")) continue;
      const depName = dep.split(/[=<> ]+/)[0].trim();
      techstack_Set.add(depName);
    }
  }
}

/**
 * Process poetry.lock file
 * @param {string} file - Path to poetry.lock
 */
function processPoetryLock(file) {
  try {
    const pkg = fs.readFileSync(file, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(pkg);
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
      return;
    }
    
    const packages = parsedFile?.package || [];
    
    if (Array.isArray(packages)) {
      for (const pkgs of packages) {
        // Add the package itself
        if (pkgs.name) {
          techstack_Set.add(pkgs.name);
        }
        
        // Add its dependencies
        const dependenciesObj = pkgs?.dependencies || {};
        processPackageSection(dependenciesObj);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

/**
 * Process setup.py file
 * @param {string} file - Path to setup.py
 */
function processSetupPy(file) {
  try {
    const pkg = fs.readFileSync(file, "utf-8");
    
    // Extract install_requires dependencies
    const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
    if (match) {
      extractDependenciesFromString(match[1]);
    }
    
    // Extract extras_require dependencies
    const match1 = pkg.match(/extras_require\s*=\s*\{([^}]+)\}/m);
    if (match1) {
      extractDependenciesFromString(match1[1]);
    }
    
    // Extract setup_requires dependencies
    const setupRequiresMatch = pkg.match(/setup_requires\s*=\s*\[([^\]]+)\]/m);
    if (setupRequiresMatch) {
      extractDependenciesFromString(setupRequiresMatch[1]);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}

/**
 * Helper to extract dependencies from string (for setup.py)
 * @param {string} depString - String containing dependencies
 */
function extractDependenciesFromString(depString) {
  // Handle quoted strings and clean up
  const deps = depString
    .split(',')
    .map(dep => {
      dep = dep.trim();
      // Remove quotes and extract package name
      const match = dep.match(/['"]([^'"]+)['"]/);
      if (match) {
        // Get package name before any version specifiers
        return match[1].split(/[<>=!~;]/)[0].trim();
      }
      return null;
    })
    .filter(Boolean);

  deps.forEach(dep => techstack_Set.add(dep));
}

/**
 * Find Python dependency files recursively
 * @param {string} dir - Directory to start from
 * @returns {string[]} - List of found dependency files
 */
function Python_dir(dir = process.cwd()) {
  try {
    const folder = fs.readdirSync(dir);
    const allFiles = [];
    
    for (const file of folder) {
      const Path = path.join(dir, file);
      const Pathstat = fs.statSync(Path);
      
      if (Pathstat.isDirectory()) {
        // Recursively search subdirectories
        const subDeps = Python_dir(Path);
        if (Array.isArray(subDeps)) {
          allFiles.push(...subDeps);
        }
      } else if (Pathstat.isFile()) {
        allFiles.push(Path);
      }
    }
    
    // Find files that match our target list
    const check = isInclude(allFiles, Python);
    return check;
  } catch (err) {
    console.error(`Error in Python_dir function:`, err.message);
    return [];
  }
}

// For ES modules, check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const dependencies = Python_dependencies();
  console.log("Found Python dependencies:", dependencies);
}