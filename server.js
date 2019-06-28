const express = require('express');
const gitHubApi = require('./gitHubApi');

/** Define the default width and depth of the tree to return */
const DEFAULT_WIDTH= 5;
const DEFAULT_DEPTH= 3;

// Set up the server
const port=8000;
const app = express();

// Quick and dirty routes. If this were a real program, I would move these into their own files.

/** A root route so it doesn't just die if you go to slash. */
app.get('/', (req,res) => {
  res.send("Usage: /followertree/[GitHub username]?width=X&depth=Y");
});

/**
 * Return an object listing the followers (and followers' followers, etc)
 * for the given username or user ID. By default, this returns five followers per level
 * and three levels of depth (not counting the passed-in username), but those
 * can be specified in the API call as get params.
 *
 * @example http://localhost:8000/followertree/user/allankcrain?width=2&depth=2
 * @example http://localhost:8000/followertree/id/12345?width=3
 */
app.get('/followertree/:by/:usernameOrId/', async (req,res) => {
  // Get the width and depth arguments (if any; default to our constants) from the request query.
  const {width=DEFAULT_WIDTH, depth=DEFAULT_DEPTH} = req.query;
  const tree = req.params.by==='username' ?
    await gitHubApi.getFollowerTree(req.params.usernameOrId, width, depth) :
    await gitHubApi.getFollowerTreeById(req.params.usernameOrId, width, depth);
  res.send(JSON.stringify(tree));
});

// Start up the server.
app.listen(port, () => {console.log(`Listening on port ${port}`)});
