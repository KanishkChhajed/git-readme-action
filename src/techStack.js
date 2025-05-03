const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const toml = require("toml");
const xml2js = require("xml2js");
const yaml = require("js-yaml");

let techstack_Set = new Set();

function isInclude(allFiles, dependencyPackage) {
  return dependencyPackage.filter((file) => allFiles.includes(file));
}

export async function detect_dependencies() {
  const workSpace = process.env.GITHUB_WORKSPACE;
  const files = fs.readdirSync(workSpace);
  const lang = process.env.GITHUB_L;

  // Identify which language is used in the project

  const JavaScript = [
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ];
  let isJavaScript = isInclude(files, JavaScript);

  const Python = [
    "requirements.txt",
    "pyproject.toml",
    "Pipfile",
    "poetry.lock",
    "setup.py",
  ];
  let isPython = isInclude(files, Python);

  const Java = ["pom.xml", "build.gradle", "build.gradle.kts"];
  let isJava = isInclude(files, Java);

  const PHP = ["composer.json", "composer.lock"];
  let isPHP = isInclude(files, PHP);

  const Ruby = ["Gemfile", "Gemfile.lock"];
  let isRuby = isInclude(files, Ruby);

  const Go = ["go.mod", "go.sum"];
  let isGo = isInclude(files, Go);

  const Rust = ["Cargo.toml", "Cargo.lock"];
  let isRust = isInclude(files, Rust);

  const NET = [".csproj", "packages.config", "project.json"];
  let isNET = isInclude(files, NET);

  const Cpp = ["CMakeLists.txt", "vcpkg.json"];
  let isCpp = isInclude(files, Cpp);

  const Swift = ["Package.swift", "Cartfile", "Podfile"];
  let isSwift = isInclude(files, Swift);

  const Kotlin = ["build.gradle", "build.gradle.kts"];
  let isKotlin = isInclude(files, Kotlin);

  const Dart = ["pubspec.yaml", "pubspec.lock"];
  let isDart = isInclude(files, Dart);

  const Elixir = ["mix.exs", "mix.lock"];
  let isElixir = isInclude(files, Elixir);

  const Scala = ["build.sbt", "build.gradle"];
  let isScala = isInclude(files, Scala);

  const Haskell = ["package.yaml", "stack.yaml", "cabal.project"];
  let isHaskell = isInclude(files, Haskell);

  const Perl = ["cpanfile", "Makefile.PL"];
  let isPerl = isInclude(files, Perl);

  const R = ["DESCRIPTION", "renv.lock"];
  let isR = isInclude(files, R);

  const Julia = ["Project.toml", "Manifest.toml"];
  let isJulia = isInclude(files, Julia);

  const Objective_C = ["Podfile", "Podfile.lock"];
  let isObjective_C = isInclude(files, Objective_C);

  if (isJavaScript.length) {
    for (const file of isJavaScript) {
      if (file === "package.json") {
        const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        let dependencyArray = Object.keys(pkg.dependencies || {});
        let devDependencyArray = Object.keys(pkg.devDependencies || {});
        for (const dep of dependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      } else if (file === "package-lock.json") {
        const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        let dependencies = pkg.packages?.[""]?.dependencies || {};
        for (const dep of dependencies) {
          techstack_Set.add(dep.split(":")[0]);
        }
      } else if (file === "yarn.lock") {
        const output = execSync(`yarn list`, { encoding: "utf-8" });
        const lines = output.trim().split("\n");
        for (const line of lines) {
          const parseLine = JSON.parse(line);
          if (parseLine.type === "tree") {
            for (const dep of parseLine.data.trees) {
              const depName = dep.name.split("@")[0];
              techstack_Set.add(depName);
            }
          }
        }
      } else if (file === "pnpm-lock.yaml") {
        const pkg = JSON.parse(fs.readFileSync(file), "utf-8");
        let dependencyArray = Object.keys(pkg.dependencies || {});
        let devDependencyArray = Object.keys(pkg.devDependencies || {});
        for (const dep of dependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      }
    }
  } else if (isPython.length) {
    for (const file of isPython) {
      if (file === "requirements.txt") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        pkg.forEach((line) => {
          techstack_Set.add(line.split("==")[0].trim());
        });
      } else if (file === "pyproject.toml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependenciesArray =
          parsedFile.tool?.poetry?.["dependencies"].split("=")[0].trim() || {};
        const devDependencyArray =
          parsedFile.tool?.poetry?.["dev-dependencies"].split("=")[0].trim() ||
          {};
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep);
        }
      } else if (file === "Pipfile") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependenciesArray =
          parsedFile?.["dev-packages"].split("=")[0].trim() || {};
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep);
        }
      } else if (file === "poetry.lock") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependenciesArray =
          parsedFile?.["package.dependencies"].split("=")[0].trim() || {};
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep);
        }
      } else if (file === "setup.py") {
        const setupPath = path.join(process.env.GITHUB_WORKSPACE, file);
        const pkg = fs.readFileSync(setupPath, "utf-8");
        const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/);
        const match1 = pkg.match(/extras_require\s*=\s*\[([^\]]+)\]/);
        if (match) {
          const deps = match[1]
            .split(",")
            .map((dep) => dep.trim().replace(/['"]/g, ""))
            .filter(Boolean);
          deps.forEach((dep) => {
            techstack_Set.add(dep);
          });
        }
        if (match) {
          const deps = match[1]
            .split(",")
            .map((dep) => dep.trim().replace(/['"]/g, ""))
            .filter(Boolean);
          deps.forEach((dep) => {
            techstack_Set.add(dep);
          });
        }
        if (match1) {
          const deps = match1[1]
            .split(",")
            .map((dep) => dep.trim().replace(/['"]/g, ""))
            .filter(Boolean);
          deps.forEach((dep) => {
            techstack_Set.add(dep);
          });
        }
      }
    }
  } else if (isJava.length) {
    for (const file of isJava) {
      if (file === "pom.xml") {
        const xmlString = fs.readFileSync(file, "utf-8");
        const parsedFile = new xml2js.Parser();
        const pkg = await parsedFile.parseStringPromise(xmlString);
        const dependenciesArray = pkg.project.dependencies[0].dependency;
        const deps = dependenciesArray.map((dep) => ({
          artifact: dep.artifactId[0],
        }));
        deps.forEach((dep) => {
          techstack_Set.add(dep);
        });
      } else if (file === "build.gradle") {
        const Path = path.join(__dirname, file);
        const pkg = fs.readFileSync(Path, "utf-8");
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
        const Path = path.join(__dirname, file);
        const pkg = fs.readFileSync(Path, "utf-8");
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
  } else if (isPHP.length) {
    for (const file of isPHP) {
      if (file === "composer.json") {
        const pkg = fs.readFileSync(file, "utf-8");
        const dependenciesArray = Object.keys(pkg.require) || {};
        const devDependencyArray = Object.keys(pkg?.["require-dev"]) || {};
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      } else if (file === "composer.lock") {
        const pkg = fs.readFileSync(file, "utf-8");
        const dependenciesArray = Object.keys(pkg.require) || {};
        const devDependencyArray = Object.keys(pkg?.["require-dev"]) || {};
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
        for (const dep of devDependencyArray) {
          techstack_Set.add(dep.split(":")[0]);
        }
      }
    }
  } else if (isRuby.length) {
    for (const file of isRuby) {
      if (file === "Gemfile") {
        const pkg = fs.readFileSync(file, "utf-8");
        const gemRegex = /^\s*gem\s+['"]([^'"]+)['"]/gm;
        let match;
        while ((match = gemRegex.exec(pkg)) !== null) {
          techstack_Set.add(match[1]);
        }
      } else if (file === "Gemfile.lock") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        let inDependenciesSection = false;
        for (let line of pkg) {
          line = line.trim();

          if (line === "DEPENDENCIES") {
            inDependenciesSection = true;
            continue;
          }
          if (inDependenciesSection && line === "") {
            break;
          }
          if (inDependenciesSection && line) {
            techstack_Set.add(line.split("(")[0].trim());
          }
        }
      }
    }
  } else if (isGo.length) {
    for (const file of isGo) {
      if (file === "go.mod") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        let inRequireBlock = false;
        for (let line of pkg) {
          line = line.trim();
          if (line.startsWith("require (")) {
            inRequireBlock = true;
            continue;
          }
          if (inRequireBlock && line === ")") {
            inRequireBlock = false;
            continue;
          }
          if (
            (inRequireBlock || line.startsWith("require ")) &&
            !line.startsWith("//")
          ) {
            let dep = line.replace("require", "").trim().split(" ")[0];
            dep = dep.split("/");
            let depName = dep[dep.length - 1];
            techstack_Set.add(depName);
          }
        }
      } else if (file === "go.sum") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        for (let dep of pkg) {
          dep = dep.split(" ")[0];
          dep = dep.split("/");
          let depName = dep[dep.length - 1];
          techstack_Set.add(depName);
        }
      }
    }
  } else if (isRust.length) {
    for (const file of isRust) {
      if (file === "Cargo.toml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependenciesObject = parsedFile?.["dependencies"] || {};
        const devDependencyObject = parsedFile?.["dev-dependencies"] || {};
        for (const dep of Object.keys(dependenciesObject)) {
          techstack_Set.add(dep);
        }
        for (const dep of Object.keys(devDependencyObject)) {
          techstack_Set.add(dep);
        }
      } else if (file === "Cargo.lock") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependenciesArray = parsedFile?.["package"] || [];
        for (const pkgEntry of dependenciesArray) {
          const deps = pkgEntry?.["dependencies"] || [];
          for (const dep of deps) {
            techstack_Set.add(dep.split(" ")[0].trim());
          }
        }
      }
    }
  } else if (isNET.length) {
    for (const file of isNET) {
      if (file.endsWith(".csproj")) {
        const xmlString = fs.readFileSync(file, "utf-8");
        const parsedFile = new xml2js.Parser();
        const pkg = await parsedFile.parseStringPromise(xmlString);
        const dependenciesArray = pkg?.Project?.ItemGroup || [];
        for (const group of dependenciesArray) {
          const PackageReference = group?.PackageReference || [];

          for (const dep of PackageReference) {
            const depName = dep?.$?.Include;
            if (depName) techstack_Set.add(depName);
          }
        }
      } else if (file === "packages.config") {
        const xmlString = fs.readFileSync(file, "utf-8");
        const parsedFile = new xml2js.Parser();
        const pkg = await parsedFile.parseStringPromise(xmlString);
        const dependenciesArray = pkg?.packages?.package || [];
        for (const dep of dependenciesArray) {
          const depName = dep?.$?.id;
          if (depName) techstack_Set.add(depName);
        }
      } else if (file === "project.json") {
        const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        let dependencyArray = Object.keys(pkg.dependencies || {});
        for (const dep of dependencyArray) {
          techstack_Set.add(dep.trim());
        }
      }
    }
  } else if (isCpp.length) {
    for (const file of isCpp) {
      if (file === "CMakeLists.txt") {
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
      } else if (file === "vcpkg.json") {
        const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        const dependenciesArray = pkg.dependencies || [];
        for (const dep of dependenciesArray) {
          if (typeof dep === "string") {
            techstack_Set.add(dep);
          } else if (typeof dep === "object" && dep.name) {
            techstack_Set.add(dep.name);
          }
        }
      }
    }
  } else if (isSwift.length) {
    for (const file of isSwift) {
      if (file === "Package.swift") {
        const pkg = fs.readFileSync(file, "utf-8");
        const packageRegex = /\.package\s*\(([\s\S]*?)\)/g;
        const urlRegex = /url:\s*["']([^"']+)["']/;
        const matches = pkg.matchAll(packageRegex);
        for (const match of matches) {
          const content = match[1];
          const urlMatch = content.match(urlRegex);
          if (urlMatch) {
            const dep = urlMatch[1].split("/");
            const depName = dep[dep.length - 1].replace(".git", "");
            techstack_Set.add(depName);
          }
        }
      } else if (file === "Cartfile") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        for (const line of pkg) {
          if (!line.trim() || line.trim().startsWith("#")) continue;
          const sep = line.trim().split(" ");
          if (sep.length < 2) continue;
          const dep = sep[1].split("/");
          const depName = dep[dep.length - 1].replace(/["']/g, "").trim();
          techstack_Set.add(depName);
        }
      } else if (file === "Podfile") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        for (const line of pkg) {
          const trimmed = line.trim();
          if (trimmed.startsWith("pod")) {
            const dep = trimmed.split(/\s+/);
            if (dep.length > 1) {
              const depName = dep[1].replace(/["',]/g, "").trim();
              techstack_Set.add(depName);
            }
          }
        }
      }
    }
  } else if (isKotlin.length) {
    for (const file of isKotlin) {
      if (file === "build.gradle") {
        const pkg = fs.readFileSync(file, "utf-8");
        const dependenciesRegex =
          /(implementation|api|compile|testImplementation|runtimeOnly|annotationProcessor)\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = dependenciesRegex.exec(pkg)) !== null) {
          const dep = match[2].split(":");
          if (dep.length >= 2) {
            techstack_Set.add(dep[1]);
          }
        }
      } else if (file === "build.gradle.kts") {
        const pkg = fs.readFileSync(file, "utf-8");
        const dependenciesRegex =
          /\b(?:implementation|api|compileOnly|runtimeOnly|testImplementation|annotationProcessor)\s*\(\s*["']([^"']+)["']\s*\)/g;
        let match;
        while ((match = dependenciesRegex.exec(pkg)) !== null) {
          const dep = match[1].split(":");
          if (dep.length >= 2) {
            techstack_Set.add(dep[1]);
          }
        }
      }
    }
  } else if (isDart.length) {
    for (const file of isDart) {
      if (file === "pubspec.yaml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = yaml.load(pkg);
        const dependenciesArray = parsedFile?.["dependencies"] || {};
        const devDependencyArray = parsedFile?.["dev_dependencies"] || {};
        for (const dep of Object.keys(dependenciesArray)) {
          techstack_Set.add(dep);
        }
        for (const dep of Object.keys(devDependencyArray)) {
          techstack_Set.add(dep);
        }
      } else if (file === "pubspec.lock") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        const parsedFile = yaml.load(pkg);
        const dependencyObject = parsedFile?.packages || {};
        for (const dep of Object.keys(dependencyObject)) {
          techstack_Set.add(dep);
        }
      }
    }
  } else if (isElixir.length) {
    for (const file of isElixir) {
      if (file === "mix.exs") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        const depRegex = /{:\s*([a-zA-Z0-9_]+)\s*,/;
        for (let line of pkg) {
          line = line.trim();
          const match = line.match(depRegex);
          if (match) {
            techstack_Set.add(match[1]);
          }
        }
      } else if (file === "mix.lock") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        const depRegex = /"([^"]+)"\s*=>/g;
        let match;
        while ((match = depRegex.exec(pkg)) !== null) {
          techstack_Set.add(match[1]);
        }
      }
    }
  } else if (isScala.length) {
    for (const file of isScala) {
      if (file === "build.sbt") {
        const pkg = fs.readFileSync(file, "utf-8");
        const Scalaregex = /"[^"]+"\s*%%?\s*"([^"]+)"\s*%\s*"[^"]+"/g;
        let match;
        while ((match = Scalaregex.exec(pkg)) !== null) {
          techstack_Set.add(match[1]);
        }
      } else if (file === "build.gradle") {
        const pkg = fs.readFileSync(file, "utf-8");
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
  } else if (isHaskell.length) {
    for (const file of isHaskell) {
      if (file === "package.yaml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = yaml.load(pkg);
        const dependenciesArray = parsedFile?.["dependencies"] || [];
        const subDependenciesArray = [
          "library",
          "executables",
          "tests",
          "benchmarks",
        ];
        for (const dep of dependenciesArray) {
          const depName =
            typeof dep === "string" ? dep.split(" ")[0] : dep?.package || dep;
          techstack_Set.add(depName);
        }
        for (const subDep of subDependenciesArray) {
          const entity = parsedFile?.[subDep];
          if (!entity) continue;
          if (subDep === "library" && entity["dependencies"]) {
            for (const dep of entity["dependencies"]) {
              const depName =
                typeof dep === "string"
                  ? dep.split(" ")[0]
                  : dep?.package || dep;
              techstack_Set.add(depName);
            }
          } else if (typeof entity === "object") {
            for (const comp of Object.values(entity)) {
              if (comp?.["dependencies"]) {
                for (const dep of comp["dependencies"]) {
                  const depName =
                    typeof dep === "string"
                      ? dep.split(" ")[0]
                      : dep?.package || dep;
                  techstack_Set.add(depName);
                }
              }
            }
          }
        }
      } else if (file === "stack.yaml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = yaml.load(pkg);
        const extraDepsDependency = parsedFile?.["extra-deps"] || [];
        for (const dep of extraDepsDependency) {
          const depName =
            typeof dep === "string"
              ? dep.split(/[-@\/]/)[0]
              : dep?.package || dep;
          techstack_Set.add(depName);
        }
        const packagesDependency = parsedFile?.["packages"] || [];
        for (const dep of packagesDependency) {
          if (
            typeof dep === "string" &&
            (dep.endsWith(".cabal") || dep.endsWith("package.yaml"))
          ) {
            techstack_Set.add(dep);
          } else if (typeof dep === "string") {
            techstack_Set.add(dep);
          }
        }
      } else if (file === "cabal.project") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        let inPackageSection = false;
        for (const line of pkg) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("packages:")) {
            inPackageSection = true;
            const packageLine = trimmedLine
              .substring(trimmedLine.indexOf(":") + 1)
              .trim()
              .split(/\s+/);
            techstack_Set.add(packageLine);
          } else if (inPackageSection) {
            if (
              trimmedLine === "" ||
              trimmedLine.startsWith("--") ||
              trimmedLine.startsWith("#")
            ) {
              continue;
            } else if (
              trimmedLine.includes(":") &&
              !trimmedLine.startsWith("package")
            ) {
              inPackageSection = false;
            } else {
              const dep = trimmedLine.split(/\s+/);
              techstack_Set.add(dep);
            }
          }
        }
      }
    }
  } else if (isPerl.length) {
    for (const file of isPerl) {
      if (file === "cpanfile") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        const perlRegex =
          /^\s*(requires|recommends|suggests)\s+['"]([^'"]+)['"]/;
        for (let line of pkg) {
          line = line.trim();
          if (line.startsWith("#") || line === "") continue;
          const match = line.match(perlRegex);
          if (match) {
            techstack_Set.add(match[2]);
          }
        }
      } else if (file === "Makefile.PL") {
        const pkg = fs.readFileSync(file, "utf-8");
        const perlRegex = /PREREQ_PM\s*=>\s*\{([\s\S]*?)\}/;
        const preDep = pkg.match(perlRegex);
        if (preDep) {
          const prereqBlock = preDep[1].split("\n");
          for (let line of prereqBlock) {
            line = line.trim();
            const lineRegex = /['"]([^'"]+)['"]\s*=>/;
            const match = line.match(lineRegex);
            if (match) {
              techstack_Set.add(match[1]);
            }
          }
        }
      }
    }
  } else if (isR.length) {
    for (const file of isR) {
      if (file === "DESCRIPTION") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        const dependenciesArray = [
          "Depends",
          "Imports",
          "Suggests",
          "LinkingTo",
        ];
        for (let line of pkg) {
          line = line.trim();
          for (const dep of dependenciesArray) {
            if (line.startsWith(dep + ":")) {
              const depList = line.split(":")[1];
              const deps = depList
                .split(",")
                .map((d) => d.trim().split(" ")[0]);
              for (const dep of deps) {
                if (dep && dep !== "R") techstack_Set.add(dep);
              }
            }
          }
        }
      } else if (file === "renv.lock") {
        const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
        const dependenciesObject = pkg?.Packages || {};
        for (const dep of Object.keys(dependenciesObject)) {
          techstack_Set.add(dep);
        }
      }
    }
  } else if (isJulia.length) {
    for (const file of isJulia) {
      if (file === "Project.toml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const dependencies = parsedFile?.["dependencies"] || {};
        for (const dep of Object.keys(dependencies)) {
          techstack_Set.add(dep);
        }
      } else if (file === "Manifest.toml") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = toml.parse(pkg);
        const packages = parsedFile || {};
        for (const key in packages) {
          if (Array.isArray(packages[key])) {
            techstack_Set.add(key);
          }
        }
      }
    }
  } else if (isObjective_C.length) {
    for (const file of isObjective_C) {
      if (file === "Podfile") {
        const pkg = fs.readFileSync(file, "utf-8").split("\n");
        for (let line of pkg) {
          line = line.trim();
          if (line.startsWith("pod")) {
            const dep = line.split(" ")[1].replace(/["',]/g, "");
            techstack_Set.add(dep);
          }
        }
      } else if (file === "Podfile.lock") {
        const pkg = fs.readFileSync(file, "utf-8");
        const parsedFile = yaml.load(pkg);
        const dependenciesArray = parsedFile?.["DEPENDENCIES"] || [];
        for (const dep of dependenciesArray) {
          techstack_Set.add(dep.split(" ")[0]);
        }
      }
    }
  } else {
    techstack_Set = [];
    console.log("No common package dependency file found....");
  }

  return Array.from(techstack_Set);
}
