// const {Octokit} =  require("octokit")

// const core = require('@actions/core')


// async function  generate(){

//     const token = core.getInput('token')
    
//     try{
//         // Authentication process
//         const octokit = new Octokit({auth : token})
//         try{
//             const { data } = await octokit.rest.repos.listForAuthenticatedUser();
//             console.log("Successfully fetched repos:", data.length);
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


const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const ejs = require('ejs');
const { Octokit } = require('@octokit/rest');

async function run() {
  try {
    // Get inputs
    const templatePath = core.getInput('template-path');
    const outputPath = core.getInput('output-path');
    const token = core.getInput('token') || process.env.GITHUB_TOKEN;

    // Initialize Octokit
    const octokit = new Octokit({ auth: token });
    const context = github.context;

    // Fetch repo data
    const { data: repoData } = await octokit.repos.get({
      owner: context.repo.owner,
      repo: context.repo.repo
    });

    // Fetch latest commits
    const { data: commits } = await octokit.repos.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      per_page: 5
    });

    // Prepare template data
    const templateData = {
      repo_name: repoData.name,
      full_name: repoData.full_name,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      open_issues: repoData.open_issues_count,
      recent_commits: commits.map(commit => ({
        sha: commit.sha.substring(0, 7),
        url: commit.html_url,
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name
      }))
    };

    // Render template
    const template = fs.readFileSync(templatePath, 'utf8');
    const output = ejs.render(template, templateData);
    fs.writeFileSync(outputPath, output);

    core.info(`✅ Successfully generated ${outputPath}`);
  } catch (error) {
    core.setFailed(`❌ Action failed: ${error.message}`);
  }
}

run();