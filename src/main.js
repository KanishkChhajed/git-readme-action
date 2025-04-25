// import { Octokit } from "@octokit/action"
// import github  from "@actions/github"
// import  core from '@actions/core'


// async function  generate(){

//     const token = core.getInput('token')
    
//     try{
//         // Authentication process
//         const octokit = new Octokit({auth : token})
//         const context = github.context
//         try{
//             const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

//             const {data : reposData} = await octokit.rest.repos.get({
//                 owner,
//                 repo
//             })

//             console.log(`Repo: ${reposData.repo}, Owner: ${reposData.owner}`);
//             console.log("Successfully authenticated and fetched repo.");
//         }catch (error){
//             console.log("Authentication process failed...")
//             console.log (error)
//         }
        

//         // console.log(token)
//         console.log("Getting token successfully")
//     }
//     catch  (error){
//         console.log(error)
//     }
// }

// generate();

import { Octokit } from "@octokit/action";

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// See https://developer.github.com/v3/issues/#create-an-issue
const { data } = await octokit.request("POST /repos/{owner}/{repo}/issues", {
  owner,
  repo,
  title: "My test issue",
});
console.log("Issue created: %s", data.html_url);