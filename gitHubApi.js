const axios = require('axios');

/**
 * GitHub API helper functions.
 */
class gitHubApi {
  /**
   * Get the Axios configuration for the API.
   * @param {string} authorization - Authorization header to pass (if any)
   * @return {Object} Axios config object
   */
  static getAxiosConfig(authorization=null) {
    const axiosConfig = {
      baseURL: 'https://api.github.com/',
      headers: {
        // GitHub's API docs recommend being explicit about the API version accepted
        'Accept': 'application/vnd.github.v3+json',
      }
    };
    if (authorization) {
      axiosConfig.headers.authorization = authorization;
    }
    return axiosConfig;
  }

  /**
   * Get a tree of GitHub followers for the given GitHub username.
   *
   * @param {string} username - The username of the user at the top of this tree.
   * @param {int} width - The number of direct children to return
   * @param {int} depth - How far down the tree to go
   * @param {string} authorization - Authorization header to pass to the GitHub API
   * @return {Promise} Promise that resolves into an object describing the follower tree from the root username.
   */
  static async getFollowerTree(username, width, depth, authorization) {
    // Set up axios headers.
    const axiosConfig = gitHubApi.getAxiosConfig(authorization);

    // Get the followers from Github's API
    const followerResponse = await axios.get(`users/${username}/followers`, axiosConfig).catch(console.log);
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
            user.followers = await gitHubApi.getFollowerTree(fullInfo.login, width, depth-1, authorization);
          }
          return user;
        }));
    }
    return tree;
  }

  /**
   * Get a tree of GitHub followers for the given GitHub ID.
   *
   * Uses github's /user/:id API to look up the user's username, then punts to getFollowerTree.
   *
   * @param {int} id - The user ID of the user at the top of this tree.
   * @param {int} width - The number of direct children to return
   * @param {int} depth - How far down the tree to go
   * @param {string} authorization - Authorization header to pass to the GitHub API
   * @return {Promise} Promise that resolves into an object describing the follower tree from the root username.
   */
  static async getFollowerTreeById(id, width, depth, authorization) {
    // Set up axios headers.
    const axiosConfig = gitHubApi.getAxiosConfig(authorization);
    // Get the user's username based on their ID.
    const idResponse = await axios.get(`user/${id}`, axiosConfig).catch(console.log);
    if (idResponse) {
      const username = idResponse.data.login;
      return gitHubApi.getFollowerTree(username, width, depth, authorization);
    }
  }
}

module.exports = gitHubApi;
