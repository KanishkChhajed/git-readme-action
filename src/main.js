const github  = require("@actions/github")
const  core  =  require('@actions/core')
const {Octokit} = require('octokit')
const ejs = require('ejs')
const fs = require('fs')
// const os = require('os')
// const {execSync} = require('node:child_process')
// const { formatWithOptions } = require("node:util")

const template_path = './temp/README_template.ejs'
const output_path = 'README.md'

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

            const {data: issueData} = await  octokit.rest.issues.listForRepo({
                owner,
                repo,
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

            const readme_Info = {
                repoName: reposData.name,
                owner: reposData.owner.login,
                language: languageArray,
                contributors: contributorArray,
                stars: reposData.stargazers_count,
                forks: reposData.forks_count,
                watchs: reposData.watchers_count,
                open_issues: reposData.open_issues_count,
                visibility: reposData.visibility,
                user_view_type: commitData.committer.user_view_type, 
                LastCommitMessage : last_commit_message,
            }
            
            console.log(readme_Info)

            const template = fs.readFileSync(template_path,'utf-8')
            const render = ejs.render(template,readme_Info)
            fs.writeFileSync(output_path , render)

            console.log("Readme file successfully generated")
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