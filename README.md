## CenturyLink coding challenge by Allan Crain

Written in Node.js using Express.js.

Presents an API endpoint to allow loading branching list of GitHub followers.

### Challenge

The main challenge was to:

> Write an API endpoint that accepts a GitHub ID and returns Follower GitHub IDs (up to 5 Followers total) associated with the passed in GitHub ID. Retrieve data up to 3 levels deep, repeating the process of retrieving Followers (up to 5 Followers total) for each Follower found. Data should be returned in JSON format.

The bonus challenge was to:

> Write an API endpoint that accepts a GitHub ID and retrieves the Repository names (up to 3 Repositories total) associated with the passed in GitHub ID, along with the Stargazer GitHub ID's (up to 3 Stargazers total) associated with each Repository. Retrieve data up to 3 levels deep, repeating the process of retrieving the associated Repositories (up to 3 Repositories total) for each Stargazer (up to 3 Stargazers total found. Data should be returned in JSON format.)

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

### Bonus API

I also went ahead and did the bonus challenge, although it's not as well-tested. The bonus API is accessible at `/repostargazers/username/[username]` or `/repostargazers/id/[user ID]` and takes the same arguments and has the same semantics as the followers API. It returns an object like this:

~~~~
[
    {
        "name": "libdc-for-dirk",
        "stargazers": [
            {
                "name": "git-hulk",
                "id": 4987594,
                "repos": [
                    {
                        "name": "9cc",
                        "stargazers": []
                    }
                ]
            }
        ]
    }
]
~~~~

Note that the width argument for this API applies to both the number of repositories and the number of stargazers returned at each level of the tree.

### Notes

* There are a few improvements that I would definitely want to make if this were a legitimate piece of software instead of just a test programming challenge. Namely:
  * Better error handling.
  * In particular, passing API errors straight to console.log in a production system would be a VERY bad idea, since that error object is going to include the headers, and the headers are going to include the authentication header, and that would be a huge security issue if it ended up in an error log. Since this is just a coding challenge for a job I might not even get, I felt that the advantages (barely a line of code; makes debugging much easier) outweighed the disadvantages (huge security issue if anyone actually used this code for real without reading this readme file and fixing that huge security issue).
  * Better support for authentication. Ideally, some sort of system using OAuth.
  * More graceful handling of GitHub rate limiting (which can be a pretty big issue if you're repeatedly testing code that hits their APIs 1+(3*5) times in rapid succession).
  * Enforce an upper limit on the depth/width arguments. Rate limiting on the GitHub side should keep this from being a viable strategy to DDOS GitHub as is, but it's still something I'd want to take care of myself in real live code just to be sure.
  * Currently, the code in server.js that handles the two APIs is virtually identical, which is big code smell. If I found myself repeating that code pattern any more, I'd want to refactor that out to minimize the duplication.
* The challenge description asks that the API work with GitHub *IDs*, but the API is designed to work with GitHub *usernames*. I wasn't sure if that was part of the challenge or if it was a mistake, so I wrote the API to support both to cover my bases. The GitHub API used to convert ID numbers into usernames appears to be itself undocumented (I found it through a Stackexchange post from 2012 that lamented that it wasn't documented).
* Special thanks to Anna Henningsen (github user addaleax), the answer to the question "Who's a random GitHub user with a bunch of followers I can use for testing?"
* Similarly, special thanks to Linus Torvalds, the answer to the question "Who's a GitHub user whose repositories are so famous that they would have a bunch of stargazers". Also thanks to Linus for creating Linux.
* The challenge text was somewhat ambiguous about how it defines depth. I wrote it to assume that 3 levels deep means that it retrieves followers, grandfollowers, and great-grandfollowers (i.e., the initial user passed in is not included in the follower depth, but the first level of followers returned is).
