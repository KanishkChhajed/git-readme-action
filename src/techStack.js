const fs = require('fs')
const { execSync } = require("child_process")
const path = require('path')
const os  = require('os')
const toml = require('toml')


let techstack_Set = new Set()

 function isInclude(allFiles,dependencyPackage){
    return  dependencyPackage.filter(file => allFiles.includes(file))
}

export async function detect_dependencies(){
    const workSpace = process.env.GITHUB_WORKSPACE;
    const files = fs.readdirSync(workSpace);
    const lang = process.env.GITHUB_L

    // Identify which language is used in the project

    const JavaScript = ['package.json', 'package-lock.json' , 'yarn.lock','pnpm-lock.yaml'];
    let isJavaScript = isInclude(files,JavaScript);
    
    const Python = ['requirements.txt','pyproject.toml','Pipfile','poetry.lock','setup.py']
    let isPython = isInclude(files,Python);
    
    const Java = ['pom.xml','build.gradle','build.gradle.kts']
    let  isJava = isInclude(files,Java);
    
    const PHP = ['composer.json','composer.lock']
    let isPHP = isInclude(files,PHP);
    
    const Ruby = ['Gemfile','Gemfile.lock']
    let isRuby = isInclude(files,Ruby);
    
    const Go = ['go.mod','go.sum']
    let isGo = isInclude(files,Go);

    const Rust = ['Cargo.toml','Cargo.lock']
    let isRust = isInclude(files,Rust);
    
    const NET = ['.csproj','packages.config','project.json']
    let isNET = isInclude(files,NET);
    
    const Cpp = ['CMakeLists.txt','vcpkg.json']
    let isCpp = isInclude(files,Cpp);
    
    const Swift = ['Package.swift','Cartfile','Podfile']
    let isSwift = isInclude(files,Swift);
    
    const Kotlin  = ['build.gradle','build.gradle.kts']
    let isKotlin = isInclude(files,Kotlin);

    const Dart = ['pubspec.yaml','pubspec.lock']
    let isDart = isInclude(files,Dart);
    
    const Elixir = ['mix.exs','mix.lock']
    let isElixir = isInclude(files,Elixir);
    
    const Scala = ['build.sbt','build.gradle']
    let isScala = isInclude(files,Scala);
    
    const Haskell = ['package.yaml','stack.yaml','cabal.project']
    let isHaskell = isInclude(files,Haskell);
    
    const Perl = ['cpanfile','Makefile.PL']
    let isPerl = isInclude(files,Perl);
    
    const R = ['DESCRIPTION','renv.lock']
    let isR = isInclude(files,R);
    
    const Julia = ['Project.toml','Manifest.toml']
    let isJulia = isInclude(files,Julia)
    
    const Objective_C = ['Podfile','Podfile.lock']
    let isObjective_C = isInclude(files,Objective_C)

    if(isJavaScript.length){
        for(const file of isJavaScript){
            if(file === 'package.json'){
                const pkg = JSON.parse(fs.readFileSync(file,'utf-8'))
                let dependencyArray= Object.keys(pkg.dependencies ||{})
                let devDependencyArray = Object.keys(pkg.devDependencies||{})
                for(const dep of dependencyArray){
                    techstack_Set.add(dep)
                }
                for (const dep of devDependencyArray){
                    techstack_Set.add(dep)
                }
            }else if(file === 'package-lock.json'){
                const pkg = JSON.parse(fs.readFileSync(file,'utf-8'))
                let dependencies = pkg.packages?.[""]?.dependencies || {}
                for(const dep of dependencies){
                    techstack_Set.add(dep)
                }
            }
            else if(file === 'yarn.lock'){
                const output = execSync(`yarn list`, {encoding:'utf-8'})
                const lines = output.trim().split('\n')
                for(const line of lines){
                    const parseLine = JSON.parse(line)
                    if(parseLine.type === 'tree'){
                        for(const dep of parseLine.data.trees){
                            const depName = dep.name.split('@')[0]
                            techstack_Set.add(depName)
                        }
                    }
                }
            }
            else if(file ==='pnpm-lock.yaml'){
                const pkg = JSON.parse(fs.readFileSync(file),'utf-8')
                let dependencyArray = Object.keys(pkg.dependencies || {})
                let devDependencyArray = Object.keys(pkg.devDependencies || {})
                for(const dep of dependencyArray){
                    techstack_Set.add(dep)
                }
                for(const dep of devDependencyArray){
                    techstack_Set.add(dep)
                }
            }

        }
    }
    else if(isPython.length){
        for(const file of isPython){
            if(file === 'requirements.txt'){
                const pkg = fs.readFileSync(file,'utf-8').split('\n')
                pkg.forEach(line =>{
                    techstack_Set.add(line.split('==')[0].trim())
                })
            }
            else if (file === 'pyproject.toml'){
                const pkg = fs.readFileSync(file,'utf-8')
                const parsedFile = toml.parse(pkg)
                const dependenciesArray = parsedFile.tool?.poetry?.['dependencies'].split('=')[0].trim() ||{}
                const devDependencyArray = parsedFile.tool?.poetry?.['dev-dependencies'].split('=')[0].trim() || {}
                for(const dep of dependenciesArray){
                    techstack_Set.add(dep)
                }
                for(const dep of devDependencyArray){
                    techstack_Set.add(dep)
                }

            }
            else if (file === 'Pipfile'){
                const pkg  = fs.readFileSync(file,'utf-8')
                const parsedFile = toml.parse(pkg)
                const dependenciesArray = parsedFile?.['dev-packages'].split('=')[0].trim() || {}
                for(const dep of dependenciesArray){
                    techstack_Set.add(dep)
                }
            }
            else if(file === 'poetry.lock'){
                const pkg = fs.readFileSync(file,'utf-8')
                const parsedFile = toml.parse(pkg)
                const dependenciesArray = parsedFile?.['package.dependencies'].split("=")[0].trim() || {}
                for(const dep of dependenciesArray){
                    techstack_Set.add(dep)
                }
            }
            else if (file === 'setup.py'){
                const setupPath = path.join(process.env.GITHUB_WORKSPACE,file)
                const pkg = fs.readFileSync(setupPath,'utf-8')
                const match = pkg.match(/install_requires\s*=\s*\[([^\]]+)\]/)
                const match1 = pkg.match(/extras_require\s*=\s*\[([^\]]+)\]/)
                if(match){
                    const deps = match[1].split(',').map(dep => dep.trim().replace(/['"]/g, '')).filter(Boolean)
                    deps.forEach(dep => {
                        techstack_Set.add(dep)
                    })
                }
                if(match){
                    const deps = match[1].split(',').map(dep => dep.trim().replace(/['"]/g, '')).filter(Boolean)
                    deps.forEach(dep => {
                        techstack_Set.add(dep)
                    })
                }
                if(match1){
                    const deps = match1[1].split(',').map(dep => dep.trim().replace(/['"]/g, '')).filter(Boolean)
                    deps.forEach(dep => {
                        techstack_Set.add(dep)
                    })
                }
            }
        }
    }
    else if(isJava.length){
        for(const file of isJava){
            if(file === 'pom.xml'){
                
            }
            else if (file === 'build.gradle'){}
            else if (file === 'build.gradle.kts'){}
        }
    }
    else if(isPHP.length){
        for(const file of isPHP){
            if(file === 'composer.json'){}
            else if(file === 'composer.lock'){}
        }
    }
    else if(isRuby.length){
        for(const file of isRuby){
            if(file === 'Gemfile'){}
            else if (file === 'Gemfile.lock'){}
        }
    }
    else if(isGo.length){
        for(const file of isGo){
            if(file === 'go.mod'){}
            else if (file === 'go.sum'){}
        }
    }
    else if(isRust.length){
        for(const file of isRust){
            if(file === 'Cargo.toml'){}
            else if (file === 'Cargo.lock'){}
        }
    }
    else if(isNET.length){
        for(const file of isNET){
            if(file === '.csproj'){}
            else if (file === 'packages.config'){}
            else if (file === 'project.json'){}
        }
    }
    else if(isCpp.length){
        for(const file of isCpp){
            if(file === 'CMakeLists.txt'){}
            else if (file === 'vcpkg.json'){}
        }
    }
    else if(isSwift.length){
        for(const file of isSwift){
            if(file === 'Package.swift'){}
            else if (file ==='Cartfile'){}
            else if(file === 'Podfile'){}
        }
    }
    else if(isKotlin.length){
        for(const file of isKotlin){
            if(file === 'build.gradle'){}
            else if (file === 'build.gradle.kts'){}
        }
    }
    else if(isDart.length){
        for(const file of isDart){
            if(file === 'pubspec.yaml'){}
            else if (file === 'pubspec.lock'){}
        }
    }
    else if(isElixir.length){
        for(const file of isElixir){
            if(file === 'mix.exs'){}
            else if(file === 'mix.lock'){}
        }
    }
    else if(isScala.length){
        for(const file of isScala){
            if(file === 'build.sbt'){}
            else if(file ==='build.gradle'){}
        }
    }
    else if(isHaskell.length){
        for(const file of isHaskell){
            if(file === 'package.yaml'){}
            else if (file === 'stack.yaml'){}
            else if(file === 'cabal.project'){}
        }
    }
    else if(isPerl.length){
        for(const file of isPerl){
            if(file === 'cpanfile'){}
            else if (file === 'Makefile.PL'){}
        }
    }
    else if(isR.length){
        for(const file of isR){
            if(file === 'DESCRIPTION'){}
            else if (file === 'renv.lock'){}
        }
    }
    else if(isJulia.length){
        for(const file of isJulia){
            if(file === 'Project.toml'){}
            if(file === 'Manifest.toml'){}
        }
    }
    else if(isObjective_C.length){
        for(const file of isObjective_C){
            if(file === 'Podfile'){}
            else if (file === 'Podfile.lock'){}
        }
    }
    else{
        console.log("No common package dependency file found....")
    }

    return Array.from(techstack_Set)
}