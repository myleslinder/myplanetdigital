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
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article']})

	plugins:

		# Provide the tagged pages
		tags:
			extension: '.html.eco'
			injectDocumentHelper: (document) ->
				document.setMeta(
					layout: 'default'
					data: "<%- @partial('tag', @) %>"
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