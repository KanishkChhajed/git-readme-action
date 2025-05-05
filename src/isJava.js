const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Java_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Java = ["pom.xml", "build.gradle", "build.gradle.kts"];
  let isJava = isInclude(files, Java);

  if (isJava.length) {
      for (const file of isJava) {
        if (file === "pom.xml") {
          const xmlString = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const parsedFile = new xml2js.Parser();
          // const pkg = await parsedFile.parseStringPromise(xmlString);
          let pkg;
          try {
            pkg = await parsedFile.parseStringPromise(xmlString);
          } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            continue;
          }
          const dependenciesArray = pkg.project.dependencies[0].dependency ||[];
          const deps = (dependenciesArray || []).map((dep) => 
            dep.artifactId?.[0]?.split(':')[0]).filter(Boolean);
          deps.forEach((dep) => {
            techstack_Set.add(dep);
          });
        } else if (file === "build.gradle") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const match = pkg.match(/dependencies\s*\{([\s\S]*?)\}/);
          if (match) {
            const depsBlock = match[1];
            const depLine = depsBlock.match(
              /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s*\(.+?\)/g
            );
            if (depLine) {
              for (const line of depLine) {
                const matchLine = line.match(/['"]([^:'"]+):([^:'"]+)/);
                if (matchLine) {
                  const artifact = matchLine[2];
                  techstack_Set.add(artifact);
                }
              }
            }
          }
        } else if (file === "build.gradle.kts") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const match = pkg.match(/dependencies\s*\{([\s\S]*?)\}/);
          if (match) {
            const depsBlock = match[1];
            const depLine = depsBlock.match(
              /(?:implementation|api|compileOnly|runtimeOnly|testImplementation|testCompile)\((['"])([^'"]+)\1\)/g
            );
            if (depLine) {
              for (const line of depLine) {
                const matchLine = line.match(/\((['"])([^:'"]+):([^:'"]+)/);
                if (matchLine) {
                  const artifact = matchLine[3];
                  techstack_Set.add(artifact);
                }
              }
            }
          }
        }
      }
    }else {
        techstack_Set = [];
        console.log("No common package dependency file found....");
      }
    return Array.from(techstack_Set).filter(Boolean);
}