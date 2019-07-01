const express = require('express');
const gitHubApi = require('./gitHubApi');


// Set up the server
const port=8000;
const app = express();

// Quick and dirty routes. If this were a real program, I would move these into their own files.

/** A root route so it doesn't just die if you go to slash. */
app.get('/', (req,res) => {
  res.send(`
    <html>
      <head>
        <title>CenturyLink Coding Challenge</title>
      </head>
      <body>
      Usage: <br/>
      <pre>
    /followertree/login/[GitHub login]
    /followertree/id/[GitHub user ID]

    /repostargazers/login/[GitHub login]
    /repostargazers/id/[GitHub user ID]
      </pre>
      </body>
    </html>
  `);
});

/**
 * Return an object listing the followers (and followers' followers, etc)
 * for the given login or user ID. By default, this returns five followers per level
 * and three levels of depth (not counting the passed-in login), but those
 * can be specified in the API call as get params.
 *
 * @example http://localhost:8000/followertree/user/allankcrain?width=2&depth=2
 * @example http://localhost:8000/followertree/id/12345?width=3
 */
app.get('/followertree/:by/:loginOrId/', async (req,res) => {
  /** Define the default width and depth of the tree to return */
  const DEFAULT_WIDTH= 5;
  const DEFAULT_DEPTH= 3;

  // Set up our API object.
  const api = new gitHubApi(req.headers.authorization);

  // Get the login. This will either be passed in explicitly or passed in as
  // an ID number and we'll need to hit the API to translate that to a login.
  const login = req.params.by === 'id' ?
    await api.getloginFromId(req.params.loginOrId) :
    req.params.loginOrId;

  // Get the width and depth arguments (if any; default to our constants) from the request query.
  const {width=DEFAULT_WIDTH, depth=DEFAULT_DEPTH} = req.query;

  // Get the follower tree and output it in JSON format.
  const tree = await api.getFollowerTree(login, width, depth);
  res.send(JSON.stringify(tree));
});

/**
 * Return an object listing the Repositories for the given login or user ID, along with
 * all Stargazers for that repository. If the depth argument is greater than 1, it will also retrieve
 * the repositories for each Stargazer login.
 *
 * @example http://localhost:8000/repostargazers/user/allankcrain?width=2&depth=2
 * @example http://localhost:8000/repostargazers/id/12345?width=3
 */
app.get('/repostargazers/:by/:loginOrId', async (req,res) => {
  /** Define the default width and depth of the tree to return */
  const DEFAULT_WIDTH= 3;
  const DEFAULT_DEPTH= 3;
  // Set up our API object.
  const api = new gitHubApi(req.headers.authorization);

  const login = req.params.by === 'id' ?
    await api.getloginFromId(req.params.loginOrId) :
    req.params.loginOrId;

  // Get the width and depth arguments (if any; default to our constants) from the request query.
  const {width=DEFAULT_WIDTH, depth=DEFAULT_DEPTH} = req.query;
  try {
    const tree = await api.getRepoStargazers(login, width, depth);
    res.send(JSON.stringify(tree));
  }
  catch(e) {
    console.log(e);
  }
});

// Start up the server.
app.listen(port, () => {console.log(`Listening on port ${port}`)});
