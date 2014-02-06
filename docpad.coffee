module.exports =
	templateData:
		site:
			title: 'Myplanet Digital'
			url: '/swat'
			styles: [
				'/vendor/components-bootstrap/css/bootstrap.css'
				'/vendor/components-bootstrap/css/bootstrap-theme.css'
				'/styles/main.css'
			]
			scripts: [
				'/vendor/jquery/jquery.js'
				'/vendor/components-bootstrap/js/bootstrap.js'
				'http://isotope.metafizzy.co/beta/isotope.pkgd.min.js'
				'/scripts/main.js'
			]

	collections:
		homepage: (database) ->
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article']})

		business: (database) ->
			database.findAllLive({tags: $has: 'business'})
		design: (database) ->
			database.findAllLive({tags: $has: 'design'})
		education: (database) ->
			database.findAllLive({tags: $has: 'education'})
		people: (database) ->
			database.findAllLive({tags: $has: 'people'})
		recruiting: (database) ->
			database.findAllLive({tags: $has: 'recruiting'})
		technology: (database) ->
			database.findAllLive({tags: $has: 'technology'})
	plugins:
		tags:
			extension: '.html.eco'
			injectDocumentHelper: (document) ->
				if document.title = 
			    document.setMeta(
			        layout: 'tag'
			        pagedCollection: document.tag
			        page:
			        	number: 1
			    )