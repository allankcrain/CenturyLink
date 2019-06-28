## CenturyLink coding challenge by Allan Crain

Written in Node.js using Express.js.

Presents an API endpoint to allow loading branching list of GitHub followers.

### Setup

1. Download and install Node.js: https://nodejs.org
2. Download the repository
3. In the repository root, run `npm install`, then `npm start`

### Testing

By default, the server starts up on port 8000. The main endpoint is `/followertree/username/[username]`, which can be accessed either simply through a web browser (`http://localhost:8000/followertree/username/allankcrain`) or through an application such as Postman.

### Notes

* There are a few improvements that I would definitely want to make if this were a legitimate piece of software instead of just a test programming challenge. Namely:
  * Better error handling.
  * GitHub authentication
  * More graceful handling of GitHub rate limiting (which can be a pretty big issue if you're repeatedly testing code that hits their APIs 3*5 times in rapid succession)
  * Get rid of follower loops (i.e., person A follows person B who follows person A)
* The challenge code asks that the API work with GitHub *IDs*, but the API is designed to work with GitHub *usernames*. I compromised and designed the API to work with either--`followertree/username/[username]` takes a username, `followertree/id/[user id]` takes a user ID. The returned object contains both usernames and IDs.
