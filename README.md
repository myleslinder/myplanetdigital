# Myplanet.io

This bage may not represent reality because docpad cli tools don't return with correct exit codes on errors therefore the build does not break when it should.
[![Build Status](https://magnum.travis-ci.com/myplanetdigital/swat.png?token=PfDoSbUzTy6wJdrqu2LE&branch=master)](https://magnum.travis-ci.com/myplanetdigital/swat)

## Development
	
	npm install docpad -g
	npm install
	docpad run --env development [-p 9997]

## Staging

	npm install docpad grunt-cli -g
	npm install
	grunt
	docpad run --env static

This downloads the external content, so be sure to be selective with your `git add`-ing.

## Deploying to GitHub Pages

Update the `url` in *docpad.coffee to use `http://myplanetdigital.github.io/swat`.

	npm install docpad grunt -g
	npm install
	grunt
	docpad deploy-ghpages --env static

This downloads the external content, so be sure to be selective with your `git add` use.

## License

Copyright © 2013+ Myplanet Digital. All rights reserved.
