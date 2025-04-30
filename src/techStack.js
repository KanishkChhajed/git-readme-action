const fs = require('fs')
const path = require('path')
const os  = require('os')


let techstack_Array = []

 function isInclude(allFiles,dependencyPackage){
    return  dependencyPackage.filter(file => allFiles.includes(file))
}

export async function detect_dependencies(){
    const workSpace = process.env.GITHUB_WORKSPACE;
    const files = fs.readdirSync(workSpace);

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
                
            }else if(file === 'package-lock.json'){}
            else if(file === 'yarn.lock'){}
            else if(file ==='pnpm-lock.yaml'){}

        }
    }
    else if(isPython.length){
        for(const file of isPython){
            if(file === 'requirements.txt'){}
            else if (file === 'pyproject.toml'){}
            else if (file === 'Pipfile'){}
            else if(file === 'poetry.lock'){}
            else if (file === 'setup.py'){}
        }
    }
    else if(isJava.length){
        for(const file of isJava){
            if(file === 'pom.xml'){}
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

}