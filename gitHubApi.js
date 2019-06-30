const axios = require('axios');

// GitHub API constants
const GITHUB_BASE_URL = 'https://api.github.com/'
const GITHUB_API_VER  = 'application/vnd.github.v3+json'

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
        }));
    }
    return tree;
  }

  /**
   * Get a user's username given their GitHub ID number.
   *
   * @param {int} id - GitHub user ID
   */
  async getUsernameFromId(id) {
    const idResponse = await this.net.get(`user/${id}`).catch(console.log);
    return idResponse.data.login;
  }
}

module.exports = gitHubApi;
