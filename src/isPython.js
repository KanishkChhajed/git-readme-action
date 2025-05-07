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
//     if (!allFiles || !dependencyPackage) return [];
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
//     if (check.length) {
//       for (const file of check) {
//           if (path.basename(file) === "requirements.txt") {
//             const pkg = fs.readFileSync(file, "utf-8").split("\n");
//             for(const line of pkg){
//               const dep = line.trim()
//               if(dep===''||dep.startsWith('#')) continue
//               const depName = dep.split(/[=<>,' ']+/)
//               techstack_Set.add(depName[0]);
//             }
            
//           } else if (path.basename(file) === "pyproject.toml") {
//             const pkg = fs.readFileSync( file, "utf-8");
//             // const parsedFile = toml.parse(pkg);
//             let parsedFile;
//             try {
//               parsedFile = toml.parse(pkg);
//             } catch (e) {
//               console.error(`Error parsing ${file}: ${e.message}`);
//               continue;
//             }
//             // const dependenciesObj = typeof parsedFile.tool?.poetry?.dependencies==='object' ? parsedFile.tool.poetry.dependencies : {};
//             // const dependenciesObj = parsedFile?.tool?.poetry?.dependencies || {};
//             const dependenciesObj = parsedFile?.project?.dependencies ||parsedFile?.tool?.poetry?.dependencies || {};
//             if(Array.isArray(dependenciesObj)){
//               for (const dep of dependenciesObj) {
//                 const match = dep.match(/^([\w\-_.]+)/);
//                 if (match) {
//                   techstack_Set.add(match[1]);
//                 }
//               }
//               // console.log("It's an array")
//               // console.log(Array.from(techstack_Set))
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
//             //     techstack_Set.add(match[1]);
//             //   }
//             // }
//             // let dependenciesArray =   []
//             // if(typeof dependenciesObj === 'string'){
//               // dependenciesArray =  dependenciesObj.split("=")[0].trim()
//               // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//               // dependenciesArray = Object.keys(dependenciesObj);
//               // }
              
//               // const devDependencyObj = parsedFile.tool?.poetry?.["dev-dependencies"]||{};
//               // let devDependencyArray =  []
//               // if(typeof devDependencyObj ==="string"){
//                 // devDependencyArray = devDependencyObj.split("=")[0].trim()
//                 // }else if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//                   // devDependencyArray = Object.keys(devDependencyObj);
//                   // }
//                   // let splitRegex = /^([\w\-_.]+)/
//                   // for (const dep of Object.keys(dependenciesObj)){
//                     // const match = dep.match(splitRegex)
//                     // let depName = dep.split(' ')[0].trim()
//                     // depName = depName.replace(/(?=\s*(0-9|>|<|=|!|$|;))/g,'')
//                     // techstack_Set.add(match[0]);
//                     // }
//                     // for (const dep of Object.keys(devDependencyObj)) {
//               // techstack_Set.add(dep);
//               // }
//             } else if (path.basename(file) === "Pipfile") {
//             const pkg = fs.readFileSync(file, "utf-8");
//             const parsedFile = toml.parse(pkg);
//             const dependenciesArray = parsedFile?.["dev-packages"] || {};
//             if(Array.isArray(dependenciesArray)){
//               for (const dep of dependenciesArray) {
//                 if(dep.startsWith("#")) continue
//                 else{
//                   const depName = dep.split("=")[0].trim()
//                   techstack_Set.add(depName);
//                 }
//               }
//               console.log("It's an array")
//               console.log(Array.from(techstack_Set))
//             }else if (typeof dependenciesArray === 'object'&& dependenciesArray !== null){
//               for (const dep of Object.keys(dependenciesArray)) {
//                 // const depName = dep.split("=")[0].trim()
//                 if(dep.startsWith("#") || dep === '') continue
//                 else{
//                   const depName = dep.split(/[=<> ]+/)[0].trim()
//                   techstack_Set.add(depName);
//                 }
//               }
//               console.log("It's an object")
//               console.log(Array.from(techstack_Set))
//             }else if(typeof dependenciesArray==='string'){
//               const lines = dependenciesArray.split('\n')
//               for(const line of lines){
//                 const dep = line.trim()
//                 if(dep === ''||dep.startsWith("#")) continue
//                 const depName = dep.split(/[=<> ]+/)[0].trim()
//                 techstack_Set.add(depName)
//               }
//             }
//             console.log("It's a string")
//             console.log(techstack_Set)
//           } else if (file === "poetry.lock") {
//             const pkg = fs.readFileSync(file, "utf-8");
//             const parsedFile = toml.parse(pkg);
//             const packages = parsedFile?.package || {};
//             for(const pkgs of packages){
//               const dependenciesObj = pkgs?.dependencies || {};
//               if(typeof dependenciesObj === 'object' && dependenciesObj !== null){
//                 for (const dep of Object.keys(dependenciesObj)) {
//                   techstack_Set.add(dep);
//                 }
//                 console.log("It's an object")
//                 console.log(Array.from(techstack_Set))
//               }else if(Array.isArray(dependenciesObj)){
//                 for(const dep of dependenciesObj){
//                   techstack_Set.add(dep)
//                 }
//                 console.log("It's an array")
//                 console.log(techstack_Set)
//               }else if(typeof dependenciesObj === "string"){
//                 techstack_Set.add(dependenciesObj)
//                 console.log("It's a string")
//                 console.log(Array.from(techstack_Set))
//               }
//             }
//           } else if (path.basename(file) === "setup.py") { 
//             const pkg = fs.readFileSync(file, "utf-8");
//             const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
//             const match1 = pkg.match(/extras_require\s*=\s*\{([^}]+)\}/m);
//             if (match) {
//               const deps = match[1].split(",").map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1]).filter(Boolean);
//               deps.forEach((dep) => {
//                 techstack_Set.add(dep);
//               });
//             }
//             // if (match) {
//               //   const deps = match[1]
//               //     .split(",")
//               //     .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
//               //     .filter(Boolean);
//               //   deps.forEach((dep) => {
//                 //     techstack_Set.add(dep);
//                 //   });
//                 // }
//                 if (match1) {
//                   const deps = match1[1]
//                   .split(",")
//                   .map((dep) => dep.trim().split(/[^a-zA-Z0-9_-]/)[1])
//                   .filter(Boolean);
//                   deps.forEach((dep) => {
//                     techstack_Set.add(dep);
//                   });
//                 }
//               }
//             }
//           }
//           else {
//             techstack_Set.clear();
//             console.log("No common package dependency file found....");
//           }
//           return Array.from(techstack_Set).filter(Boolean);
//         }catch (err){
//           console.error(`Error occured:`,err.message)
//       }
//     }
        
//  async function Python_dir(dir = process.cwd()){
//           // const dir = process.cwd()
//            try{
//             const folder = fs.readdirSync(dir)
//             const allFiles = []
//             for(const file of folder){
//               const Path = path.join(dir,file)
//               const Pathstat = fs.statSync(Path)
//               if(Pathstat.isDirectory()){
//                 const subDeps = await Python_dir(Path)
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

// Python dependency files we're looking for
const PYTHON_DEP_FILES = [
  "requirements.txt",
  "pyproject.toml",
  "Pipfile",
  "poetry.lock",
  "setup.py",
];

// Set to collect unique dependencies
const techStack = new Set();

/**
 * Filters files to find those matching our target dependency filenames
 * @param {string[]} allFilePaths - List of file paths to check
 * @param {string[]} targetFiles - List of filenames to look for
 * @returns {string[]} - Matching file paths
 */
function findMatchingFiles(allFilePaths, targetFiles) {
  if (!Array.isArray(allFilePaths) || !Array.isArray(targetFiles)) {
    console.error("Invalid input to findMatchingFiles");
    return [];
  }
  
  return allFilePaths.filter(filePath => 
    targetFiles.includes(path.basename(filePath))
  );
}

/**
 * Process requirements.txt file
 * @param {string} filePath - Path to requirements.txt
 */
function processRequirementsTxt(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    
    for (const line of lines) {
      const dep = line.trim();
      // Skip empty lines and comments
      if (dep === '' || dep.startsWith('#')) continue;
      
      // Extract package name before any version specifiers
      const depName = dep.split(/[=<>~,' ']+/)[0].trim();
      if (depName) techStack.add(depName);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

/**
 * Process pyproject.toml file
 * @param {string} filePath - Path to pyproject.toml
 */
function processPyprojectToml(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(content);
    } catch (e) {
      console.error(`Error parsing ${filePath}: ${e.message}`);
      return;
    }
    
    // Try multiple possible dependency locations
    const dependenciesObj = 
      parsedFile?.project?.dependencies || 
      parsedFile?.tool?.poetry?.dependencies || 
      {};
    
    // Handle dependencies based on their type
    if (Array.isArray(dependenciesObj)) {
      for (const dep of dependenciesObj) {
        const match = dep.match(/^([\w\-_.]+)/);
        if (match) techStack.add(match[1]);
      }
    } else if (typeof dependenciesObj === "string") {
      const lines = dependenciesObj.split('\n');
      for (const dep of lines) {
        if (dep.trim() === '' || dep.trim().startsWith('#')) continue;
        
        const match = dep.match(/^([\w\-_.]+)/);
        if (match) techStack.add(match[1]);
      }
    } else if (typeof dependenciesObj === 'object' && dependenciesObj !== null) {
      for (const dep of Object.keys(dependenciesObj)) {
        techStack.add(dep);
      }
    }
    
    // Also check dev dependencies if they exist
    const devDependencies = parsedFile?.tool?.poetry?.["dev-dependencies"] || {};
    if (typeof devDependencies === 'object' && devDependencies !== null) {
      for (const dep of Object.keys(devDependencies)) {
        techStack.add(dep);
      }
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

/**
 * Process Pipfile
 * @param {string} filePath - Path to Pipfile
 */
function processPipfile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(content);
    } catch (e) {
      console.error(`Error parsing ${filePath}: ${e.message}`);
      return;
    }
    
    // Process packages section
    const packagesObj = parsedFile?.packages || {};
    processPackageObject(packagesObj);
    
    // Process dev-packages section
    const devPackagesObj = parsedFile?.["dev-packages"] || {};
    processPackageObject(devPackagesObj);
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

/**
 * Process poetry.lock file
 * @param {string} filePath - Path to poetry.lock
 */
function processPoetryLock(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    let parsedFile;
    
    try {
      parsedFile = toml.parse(content);
    } catch (e) {
      console.error(`Error parsing ${filePath}: ${e.message}`);
      return;
    }
    
    // Get package names
    const packages = parsedFile?.package || [];
    if (Array.isArray(packages)) {
      for (const pkg of packages) {
        if (pkg?.name) {
          techStack.add(pkg.name);
        }
        
        // Also process dependencies of each package
        const dependencies = pkg?.dependencies || {};
        processPackageObject(dependencies);
      }
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

/**
 * Process setup.py file
 * @param {string} filePath - Path to setup.py
 */
function processSetupPy(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Extract install_requires dependencies
    const installRequiresMatch = content.match(/install_requires\s*=\s*\[([^\]]+)\]/m);
    if (installRequiresMatch) {
      extractDependenciesFromString(installRequiresMatch[1]);
    }
    
    // Extract extras_require dependencies
    const extrasRequireMatch = content.match(/extras_require\s*=\s*\{([^}]+)\}/m);
    if (extrasRequireMatch) {
      extractDependenciesFromString(extrasRequireMatch[1]);
    }
    
    // Extract setup_requires dependencies
    const setupRequiresMatch = content.match(/setup_requires\s*=\s*\[([^\]]+)\]/m);
    if (setupRequiresMatch) {
      extractDependenciesFromString(setupRequiresMatch[1]);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
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

  deps.forEach(dep => techStack.add(dep));
}

/**
 * Process generic package object (used by multiple parsers)
 * @param {Object|Array|string} packageObj - Package object in various formats
 */
function processPackageObject(packageObj) {
  if (Array.isArray(packageObj)) {
    // Handle array format
    for (const dep of packageObj) {
      if (typeof dep === 'string') {
        const match = dep.match(/^([\w\-_.]+)/);
        if (match) techStack.add(match[1]);
      }
    }
  } else if (typeof packageObj === 'string') {
    // Handle string format
    const lines = packageObj.split('\n');
    for (const line of lines) {
      const dep = line.trim();
      if (dep === '' || dep.startsWith('#')) continue;
      
      const depName = dep.split(/[=<>~,' ']+/)[0].trim();
      if (depName) techStack.add(depName);
    }
  } else if (typeof packageObj === 'object' && packageObj !== null) {
    // Handle object format
    for (const dep of Object.keys(packageObj)) {
      techStack.add(dep);
    }
  }
}

/**
 * Find Python dependency files recursively and process them
 * @param {string} dir - Directory to start searching from
 * @returns {string[]} - List of found dependency files
 */
function findPythonDepFiles(dir = process.cwd()) {
  try {
    const foundFiles = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively search subdirectories
        const subDirFiles = findPythonDepFiles(itemPath);
        foundFiles.push(...subDirFiles);
      } else if (stats.isFile() && PYTHON_DEP_FILES.includes(path.basename(itemPath))) {
        // Found a matching file
        foundFiles.push(itemPath);
      }
    }
    
    return foundFiles;
  } catch (err) {
    console.error(`Error scanning directory ${dir}: ${err.message}`);
    return [];
  }
}

/**
 * Main function to extract Python dependencies
 * @returns {string[]} - Array of unique dependencies
 */
export function Python_dependencies() {
  try {
    // Clear any previous results
    techStack.clear();
    
    // Find all Python dependency files
    const depFiles = findPythonDepFiles();
    
    if (depFiles.length === 0) {
      console.log("No Python dependency files found");
      return [];
    }
    
    // Process each file according to its type
    for (const file of depFiles) {
      const fileName = path.basename(file);
      
      switch (fileName) {
        case "requirements.txt":
          processRequirementsTxt(file);
          break;
        case "pyproject.toml":
          processPyprojectToml(file);
          break;
        case "Pipfile":
          processPipfile(file);
          break;
        case "poetry.lock":
          processPoetryLock(file);
          break;
        case "setup.py":
          processSetupPy(file);
          break;
      }
    }
    
    // Return unique dependencies
    return Array.from(techStack).filter(Boolean);
  } catch (err) {
    console.error(`Error extracting Python dependencies: ${err.message}`);
    return [];
  }
}

// For testing purposes
// In ES modules, we can check if this is the main module
// by comparing import.meta.url to process.argv[1]
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const dependencies = Python_dependencies();
  console.log("Found Python dependencies:", dependencies);
}