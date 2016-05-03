# hacka-news
-----------------
A node module that utilizes the [Hacker News](https://news.ycombinator.com/) [official API](https://github.com/HackerNews/API) and powers [my command line app (of similar name)](https://github.com/Coteh/hacka-news-cli).

## Features
- Returns results from HN feeds (top, new, ask, show, and job)
- Returns stories in either parsed or unparsed JSON
- Return a story url for post of ID

## Installation
Clone the repository with:  
`git clone https://github.com/Coteh/hacka-news`

Then to install all the dependencies, run:  
`npm install`

## Testing
Currently, the tests are set up using the [mocha](http://mochajs.org/) testing framework, and assertions done using [should](https://www.npmjs.com/package/should).

To run the tests, make sure you have mocha installed globally using:  
`npm install -g mocha`

Then run the tests using:  
`mocha`

## Issues
- Error comments are unorganized
- No integration testing

## Future Additions
- Filter feed results by story url or some other method of organization
- More soon...
