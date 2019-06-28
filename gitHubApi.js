const axios = require('axios');

const baseurl = 'https://api.github.com/';

/** Set up a customized Axios config */
const net = axios.create({
  headers: {
    // GitHub's API docs recommend being explicit about the API version accepted
    'Accept': 'application/vnd.github.v3+json',
  }
});

/**
 * GitHub API helper functions.
 */
class gitHubApi {
  /**
   * Get a tree of GitHub followers for the given GitHub username.
   *
   * @param {string} username - The username of the user at the top of this tree.
   * @param {int} width - The number of direct children to return
   * @param {int} depth - How far down the tree to go
   * @return {Promise} Promise that resolves into an object describing the follower tree from the root username.
   */
  static async getFollowerTree(username, width, depth) {
    // Get the followers from Github's API
    const followerResponse = await net.get(`${baseurl}users/${username}/followers`).catch(console.log);
    const tree = followerResponse.data
      .slice(0, width)
      .map( async (fullInfo) => {
        const user = {id: fullInfo.id, name: fullInfo.login};
        if (depth > 0) {
          user.followers = await gitHubApi.getFollowerTree(fullInfo.name, width, depth-1);
        }
        return user;
      });

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
   * @return {Promise} Promise that resolves into an object describing the follower tree from the root username.
   */
  static async getFollowerTreeById(id, width, depth) {
    // Get the user's username based on their ID.
    const idResponse = await net.get(`${baseurl}/user/${id}`).catch(console.log);
    const username = idResponse.data.login;
    return gitHubApi.getFollowerTree(username, width, depth);
  }
}

module.exports = gitHubApi;
