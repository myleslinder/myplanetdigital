# Myplanet.io

## Development

	npm install docpad -g
	npm install
	docpad run

## Staging

	npm install docpad grunt -g
	npm install
	grunt
	docpad run --env production

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
