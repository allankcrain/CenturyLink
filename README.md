## CenturyLink coding challenge by Allan Crain

Written in Node.js using Express.js.

Presents an API endpoint to allow loading branching list of GitHub followers.

### Setup

1. Download and install Node.js: https://nodejs.org
2. Download the repository
3. In the repository root, run `npm install`, then `npm start`

### Testing

By default, the server starts up on port 8000. The main endpoint is `/followertree/username/[username]`, which can be accessed either simply through a web browser (`http://localhost:8000/followertree/username/allankcrain`) or through an application such as Postman.

There is also a secondary API endpoint `/followertree/id/[id]` which operates identically (other than taking a GitHub ID instead of a username--see Notes section below).

The APIs accept optional GET parameters for width and depth limits on the returned trees. By default, it uses a width of 5 and a depth of 3.

The API is set up to use Basic Authentication to authenticate with GitHub, which you will want to use if you want to do any significant amount of testing (otherwise, GitHub will rate-limit your connection fairly quickly). Postman can be configured to send GitHub credentials in the Authorization tab.

The API response will come back as a JSON-formatted tree shaped like so:

~~~~
[
  {
    id: 12345,
    name: 'johndoe',
    followers:
      [
        {
          id: 12346,
          name: 'johndoejr'
        },
        {
          id: 24601,
          name: 'jeanvaljean'
        }
      ],
  },
  {
   id: 1066,
   name: 'hastings'     
  }
]
~~~~

### Notes

* There are a few improvements that I would definitely want to make if this were a legitimate piece of software instead of just a test programming challenge. Namely:
  * Better error handling.
  * Better support for authentication. Ideally, some sort of system using OAuth.
  * More graceful handling of GitHub rate limiting (which can be a pretty big issue if you're repeatedly testing code that hits their APIs 3*5 times in rapid succession).
  * Filter out duplicate users from follower loops (i.e., person A follows person B who follows person A back).
* The challenge description asks that the API work with GitHub *IDs*, but the API is designed to work with GitHub *usernames*. I wasn't sure if that was part of the challenge or if it was a mistake, so I wrote the API to support both to cover my bases. The GitHub API used to convert ID numbers into usernames appears to be itself undocumented (I found it through a Stackexchange post from 2012 that lamented that it wasn't documented).
* Special thanks to Anna Henningsen (github user addaleax), the answer to the question "Who's a random GitHub user with a bunch of followers I can use for testing?"
* The challenge text was somewhat ambiguous about how it defines depth. I wrote it to assume that 3 levels deep means that it retrieves followers, grandfollowers, and great-grandfollowers (i.e., the initial user passed in is not included in the follower depth, but the first level of followers returned is).
