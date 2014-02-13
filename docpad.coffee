module.exports =
	templateData:
		site:
			title: 'Myplanet Digital'
			url: ''
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

	# Set up collections to query and sort documents.
	collections:
		homepage: (database) ->
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article', 'careers']}, {date: -1})
		careers: (database) ->
			database.findAllLive({tags: $has: 'careers'}, {date: -1})
		design: (database) ->
			database.findAllLive({tags: $has: 'design'}, {date: -1})
		people: (database) ->
			database.findAllLive({tags: $has: 'people'}, {date: -1})
		business: (database) ->
			database.findAllLive({tags: $has: 'business'}, {date: -1})
		technology: (database) ->
			database.findAllLive({tags: $has: 'technology'}, {date: -1})
		culture: (database) ->
			database.findAllLive({tags: $has: 'culture'}, {date: -1})
		events: (database) ->
			database.findAllLive({tags: $has: 'events'}, {date: -1})

	plugins:

		# Provide the tagged pages
		tags:
			extension: '.html'
			injectDocumentHelper: (document) ->
				tag = document.get('tag')
				document.setMeta(
					layout: 'articles'
					isPaged: true
					pagedCollection: tag
					pageSize: 6
					title: tag.charAt(0).toUpperCase() + tag.slice(1)
				)

		# Formatting for the dates
		moment:
			formats: [
				{
					formatted: 'dateMedium'
					format: 'MMMM Do YYYY'
					raw: 'date'
				}
				{
					formatted: 'dateLong'
					format: 'dddd, MMM DD, YYYY'
					raw: 'date'
				}
			]