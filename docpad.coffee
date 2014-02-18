module.exports =
	templateData:
		site:
			title: 'Myplanet Digital'
			url: ''
			styles: [
				'/styles/site.css'
				'/styles/modules/tiles.css'
				'/styles/modules/article.css'
				'/styles/modules/menu.css'
			]
			scripts: [
				'/scripts/vendor/isotope-beta2.pkgd.min.js'
				'/scripts/main.js'
				'/scripts/vendor/jquery-2.1.0.min.js'
				'/scripts/pollyfill.js'
				'/scripts/vendor/scrollfix.js'
				'/scripts/modules/tiles.js'
				'/scripts/modules/menu.js'
				'/scripts/main.js'
				'/scripts/animator.js'
				'/scripts/vendor/fastclick.js'
				'/scripts/init.js'
				'/scripts/vendor/prism.js'
			]

			# Social Media Services
			services:
				googleAnalytics: 'UA-16401713-2'

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
					$nin: ['content', 'content-tile']
				, {date: -1}

		# Create a collection for each available tag.
		careers: (database) ->
			database.findAllLive
				tags:
					$has: 'careers'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		design: (database) ->
			database.findAllLive
				tags:
					$has: 'design'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		people: (database) ->
			database.findAllLive
				tags:
					$has: 'people'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		business: (database) ->
			database.findAllLive
				tags:
					$has: 'business'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		technology: (database) ->
			database.findAllLive
				tags:
					$has: 'technology'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		culture: (database) ->
			database.findAllLive
				tags:
					$has: 'culture'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}
		events: (database) ->
			database.findAllLive
				tags:
					$has: 'events'
				layout:
					$nin: ['content', 'content-tile']
				, {date: -1}

		# Rendered content into individual segmented HTML pages.
		content: (database) ->
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article', 'careers']}).on "add", (model) ->
				model.setMetaDefaults({additionalLayouts: ['content', 'content-tile']})

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
					pageSize: 999999
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

	# Environmental variables
	environments:
		development:
			templateData:
				site:
					# Disable certain services on the development environment.
					services:
						googleAnalytics: false
