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

	plugins:
		tags:
			extension: '.html.eco'
			injectDocumentHelper: (document) ->
				document.setMeta(
					layout: 'default'
					data: "<%- @partial('tag', @) %>"
				)