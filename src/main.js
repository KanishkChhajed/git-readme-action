const github  = require("@actions/github")
const  core  =  require('@actions/core')
const {Octokit} = require('octokit')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const { execSync } = require("child_process")
// const os = require('os')
// const {execSync} = require('node:child_process')
// const { formatWithOptions } = require("node:util")

const template_path = './temp/README_template3.ejs'
const output_path = 'README.md'

async function detect_dependencies(){
    const workSpace = process.env.GITHUB_WORKSPACE;
    const files = fs.readdirSync(workSpace);
    const isJavaScript = files.includes('package.json'|| 'package-lock.json' || 'yarn.lock'||'pnpm-lock.yaml');
    const isPython = files.includes('requirements.txt'||'pyproject.toml' ||'Pipfile' ||'poetry.lock' || 'setup.py')
    const isJava = files.includes('pom.xml' ||'build.gradle'||'build.gradle.kts')
    const isPHP = files.includes('composer.json'|| 'composer.lock')
    const isRuby = files.includes('Gemfile' ||'Gemfile.lock')
    const isGo = files.includes('go.mod'|| 'go.sum')
    const isRust = files.includes('Cargo.toml' ||'Cargo.lock')
    const isNET = files.includes('.csproj' ||'packages.config' ||'project.json')
    const isCpp = files.includes('CMakeLists.txt' ||'vcpkg.json')
    const isSwift = files.includes('Package.swift' ||'Cartfile'||'Podfile')
    const isKotlin  = files.includes('build.gradle' ||'build.gradle.kts')
    const isDart = files.includes('pubspec.yaml' ||'pubspec.lock')
    const isElixir = files.includes('mix.exs' ||'mix.lock')
    const isScala = files.includes('build.sbt'|| 'build.gradle')
    const isHaskell = files.includes('package.yaml' ||'stack.yaml' ||'cabal.project')
    const isPerl = files.includes('cpanfile' || 'Makefile.PL')
    const isR = files.includes('DESCRIPTION' ||'renv.lock')
    const isJulia = files.includes('Project.toml'||'Manifest.toml')
    const isObjective_C = files.includes('Podfile'||'Podfile.lock')

    if(isJavaScript){}
    else if(isPython){}
    else if(isJava){}
    else if(isPHP){}
    else if(isRuby){}
    else if(isGo){}
    else if(isRust){}
    else if(isNET){}
    else if(isCpp){}
    else if(isSwift){}
    else if(isKotlin){}
    else if(isDart){}
    else if(isElixir){}
    else if(isScala){}
    else if(isHaskell){}
    else if(isPerl){}
    else if(isR){}
    else if(isJulia){}
    else if(isObjective_C){}
    else{
        console.log("No common dependency file found")
    }

}

async function  generate_readme(){

    const token = core.getInput('token')
    
    try{
        // Authentication process
        const octokit = new Octokit({auth : token})
        try{
            // Get repository {owner}/{repo} info
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
           
            // Create an API using {owner}/{repo}
            const {data : reposData} = await octokit.rest.repos.get({
                owner,
                repo,
            });

            // const ref = process.env.GITHUB_SHA

            const {data : commitData} =  await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref: "main",
            });

            // const {data: issueData} = await  octokit.rest.issues.listForRepo({
            //     owner,
            //     repo,
            // })

            const {data : issueDataClosed} = await octokit.rest.issues.listForRepo({
                owner,
                repo,
                state : 'closed',
            })
            const last_commit_message = commitData.commit.message;
            const repo_language = reposData.languages_url;
            const repo_contributors = reposData.contributors_url;

            const {data : languages} = await octokit.request(`GET ${repo_language}`);

            const languageArray  = Object.keys(languages);

            const {data: contributors} = await octokit.request(`GET ${repo_contributors}`)

            const contributorArray = contributors.map(contributor =>({
                contributorName : contributor.login,
                contributionCount : contributor.contributions,
            }));

            const {data: techStack} = await octokit.rest.dependencyGraph.createRepositorySnapshot({
                owner,
                repo,
                ref:`${reposData.default_branch}`,
                version: 0,
                sha: `${commitData.sha}`,
                job:{
                    id: `${reposData.id}`,
                    correlator:`${process.env.GITHUB_WORKFLOW+process.env.GITHUB_JOB}`,
                },
                detector:{
                    name : "custom-github-action",
                    version :"0",
                    url : `${reposData.html_url}`,
                },
                manifests:{
                    name: package.json,
                },
                scanned: 'true',

            })

            const readme_Info = {
                repoFullName: reposData.full_name,
                repoName: reposData.name,
                owner: reposData.owner.login,
                owner_avatar:reposData.owner.avatar_url,
                language: languageArray,
                contributors: contributorArray,
                stars: reposData.stargazers_count,
                forks: reposData.forks_count,
                watchs: reposData.watchers_count,
                open_issues: reposData.open_issues_count,
                closed_issues: issueDataClosed.length,
                visibility: reposData.visibility,
                user_view_type: commitData.committer.user_view_type, 
                LastCommitMessage : last_commit_message,
            }
            
            console.log(readme_Info)
            console.log(techStack)

            const template = fs.readFileSync(template_path,'utf-8')
            const render = ejs.render(template,readme_Info)
            fs.writeFileSync(output_path , render)

            console.log("Readme file successfully generated")
            execSync(`git config --global user.email "${reposData.owner.email}"`)
            execSync(`git config --global user.name "${reposData.owner.login}"`)
            execSync(`git add README.md`)
            execSync(`git commit -m "📚 Auto-generation README"`)
            execSync(`git push -u origin main`)
            console.log("Successfully pushed to README.md")
            // console.log(`Repos Languages : ${JSON.stringify(languages)}`)
            // console.log(`Issues : ${JSON.stringify(issueData)}`)
            // console.log(`Commit Message : ${JSON.stringify(last_commit_message)}`)
            // console.log(`Languages: ${JSON.stringify(repo_language)}`);
            // console.log(`Repo Data: ${JSON.stringify(reposData)}`);
            // console.log(`Commit Data: ${JSON.stringify(commitData)}`);
            console.log("Successfully authenticated and fetched repo.");
        }catch (error){
            console.log("Authentication process failed...")
            console.log (error)
        }
        

        // console.log(token)
        console.log("Getting token successfully")
    }
    catch  (error){
        console.log(error)
    }
}

generate_readme();