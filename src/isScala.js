const fs = require("fs");
const path = require("path");


let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  if (!allFiles || !dependencyPackage) return [];
  return dependencyPackage.filter((file) => allFiles.includes(path.basename(file)));
}

export async function Scala_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  // const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const Scala = ["build.sbt", "build.gradle"];
  let isScala = isInclude(files, Scala);

  if (isScala.length) {
      for (const file of isScala) {
        if (file === "build.sbt") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const Scalaregex = /"[^"]+"\s*%%?\s*"([^"]+)"\s*%\s*"[^"]+"/g;
          let match;
          while ((match = Scalaregex.exec(pkg)) !== null) {
            techstack_Set.add(match[1]);
          }
        } else if (file === "build.gradle") {
          const pkg = fs.readFileSync(path.join(workSpace, file), "utf-8");
          const dependenciesRegex =
            /(implementation|api|compile|testImplementation|runtimeOnly|annotationProcessor)\s+['"]([^'"]+)['"]/g;
          let match;
          while ((match = dependenciesRegex.exec(pkg)) !== null) {
            const dep = match[2].split(":");
            if (dep.length >= 2) {
              techstack_Set.add(dep[1]);
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