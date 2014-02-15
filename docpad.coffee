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
		# The homepage collection to bring up all content, ordered by date.
		homepage: (database) ->
			database.findAllLive
				relativeOutDirPath:
					$in: [
						'people'
						'article'
						'careers'
					]
				layout:
					$ne: 'content'
				, {date: -1}

		# Create a collection for each available tag.
		careers: (database) ->
			database.findAllLive
				tags:
					$has: 'careers'
				layout:
					$ne: 'content'
				, {date: -1}
		design: (database) ->
			database.findAllLive
				tags:
					$has: 'design'
				layout:
					$ne: 'content'
				, {date: -1}
		people: (database) ->
			database.findAllLive
				tags:
					$has: 'people'
				layout:
					$ne: 'content'
				, {date: -1}
		business: (database) ->
			database.findAllLive
				tags:
					$has: 'business'
				layout:
					$ne: 'content'
				, {date: -1}
		technology: (database) ->
			database.findAllLive
				tags:
					$has: 'technology'
				layout:
					$ne: 'content'
				, {date: -1}
		culture: (database) ->
			database.findAllLive
				tags:
					$has: 'culture'
				layout:
					$ne: 'content'
				, {date: -1}
		events: (database) ->
			database.findAllLive
				tags:
					$has: 'events'
				layout:
					$ne: 'content'
				, {date: -1}

		# Rendered content into individual segmented HTML pages.
		content: (database) ->
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article', 'careers']}).on "add", (model) ->
				model.setMetaDefaults({additionalLayouts: 'content'})

		# Navigation menu.
		menu: (database) ->
			database.findAllLive({menu: $gt: 0}, {menu: 1})

	plugins:

		# Provide the tagged pages
		tags:
			extension: '.html'
			injectDocumentHelper: (document) ->
				tag = document.get('tag')
				name = tag.charAt(0).toUpperCase() + tag.slice(1)
				meta = {
					layout: 'articles'
					isPaged: true
					pagedCollection: tag
					pageSize: 12
				}
				# Add the menu items for those that need them.
				# @todo Move this to a seperate .json file?
				switch name
					when "Company"
						meta.title = "Our Company"
						meta.menu = 2
					when "Work"
						meta.title = "Our Work"
						meta.menu = 3
					when "People"
						meta.title = "Our People"
						meta.menu = 4
					when "Careers"
						meta.title = "Careers Opps"
						meta.menu = 5
					when "Design"
						meta.title = "Design Thinking"
						meta.menu = 6
					when "Technology"
						meta.title = "Tech Thinking"
						meta.menu = 7
					when "Business"
						meta.title = "Business Thinking"
						meta.menu = 8
				document.setMeta(meta)

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

		associatedfiles:
			useRelativeBase: true
