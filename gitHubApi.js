const axios = require('axios');

// GitHub API constants
const GITHUB_BASE_URL = 'https://api.github.com/';
const GITHUB_API_VER  = 'application/vnd.github.v3+json';

/**
 * GitHub API helper functions.
 */
class gitHubApi {
  /**
   * gitHubApi class constructor.
   *
   * Sets up a custom Axios object with the API version, base URL, and (optionally) authorization headers.
   */
  constructor(authorization) {
    const axiosConfig = {
      baseURL: GITHUB_BASE_URL,
      headers: {
        // GitHub's API docs recommend being explicit about the API version accepted
        'Accept': GITHUB_API_VER,
      }
    };
    if (authorization) {
      axiosConfig.headers.authorization = authorization;
    }

    this.net = axios.create(axiosConfig);
  }

  /**
   * Get a tree of GitHub followers for the given GitHub username.
   *
   * @param {string} username - The username of the user at the top of this tree.
   * @param {int} width - The number of direct children to return
   * @param {int} depth - How far down the tree to go
   * @return {Promise} Promise that resolves into an object describing the follower tree from the root username.
   */
  async getFollowerTree(username, width, depth) {
    // Get the followers from Github's API
    const followerResponse = await this.net.get(`users/${username}/followers`).catch(console.log);
    // Build the follower tree for the returned followers.
    let tree = [];
    if (followerResponse) {
      // This is a complicated "line" of code.
      // 1. Whole thing is wrapped in an await Promise.all because it's
      //    generating an array of Promise objects (and possibly a whole tree
      //    of them)
      // 2. Slices out just the number of followers from the width argument
      // 3. Maps an {id, name} object for each follower, potentially also
      //    with a follower member for a subtree of followers (calling this
      //    function recursively to generate it) if we're not at our depth
      //    limit yet.
      tree = await Promise.all(followerResponse.data
        .slice(0, width)
        .map( async (fullInfo) => {
          const user = {id: fullInfo.id, name: fullInfo.login};
          if (depth > 1) {
            user.followers = await this.getFollowerTree(fullInfo.login, width, depth-1);
          }
          return user;
        })
      );
    }
    return tree;
  }

  /**
   * Get a tree of repositories, their stargazers, and their stargazers' repositories.
   *
   * @param {string} username - Name of the user whose repositories should start the tree
   * @param {int} width - Number of repositories/stargazers to return at each level.
   * @param {int} depth - Depth of results to return.
   * @return {object} Repo/Stargazer tree.
   */
  async getRepoStargazers(username, width, depth) {
    // Get the list of repositories for the requested user.
    const repoResponse = await this.net.get(`users/${username}/repos`).catch(console.log);
    let tree = [];
    if (repoResponse) {
      // Go through all of the repositories and get the data we care about
      // (the name and the stargazers)
      tree = await Promise.all(repoResponse.data
        .slice(0, width)
        .map( async (repoInfo) => {
          const name = repoInfo.name;
          const repo = {name};
          // Get the Stargazers for this repo.
          const stargazersResponse = await this.net.get(`repos/${username}/${name}/stargazers`).catch(console.log);
          if (stargazersResponse) {
            const stargazers = await Promise.all(stargazersResponse.data
              .slice(0, width)
              .map( async (sgInfo) => {
                const stargazer = {name: sgInfo.login, id: sgInfo.id};
                // Recurse if we haven't hit our depth limit.
                if (depth > 1) {
                  stargazer.repos = await this.getRepoStargazers(sgInfo.login, width, depth-1);
                }
                return stargazer;
              }));
            repo.stargazers = stargazers;
          }
          return repo;
        })
      );
    }
    return tree;
  }

  /**
   * Get a user's username given their GitHub ID number.
   *
   * @param {int} id - GitHub user ID
   * @return {string} GitHub Username
   */
  async getUsernameFromId(id) {
    const idResponse = await this.net.get(`user/${id}`).catch(console.log);
    return idResponse.data.login;
  }
}

module.exports = gitHubApi;
