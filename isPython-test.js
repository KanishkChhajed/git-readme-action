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
