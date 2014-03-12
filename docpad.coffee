module.exports =
	# Experimaentally figured out that 4 is warnings and more severe
	# logLevel: (if ('-d' in process.argv) then 7 else 4)

	templateData:
		site:
			title: 'Myplanet Digital'
			url: 'http://myplanetdigital.github.io/swat'
			styles: [
				'/styles/main.css'
			]
			# The order of these matters big time!!!
			scripts: [
				'/scripts/pollyfill.js'
				'/scripts/vendor/scrollfix.js'
				'/scripts/modules/menu.js'
				'/scripts/modules/tiles.js'
				'/scripts/modules/elevator.js'
				'/scripts/main.js'
				'/scripts/vendor/fastclick.js'
				'/scripts/vendor/history.min.js'
				'/scripts/init.js'
				'/scripts/vendor/prism.js'
			]
			'ie8styles': [
				'/styles/site-ie8.css'
			]
			'jquery1': [
				'/scripts/vendor/jquery-1.11.0.min.js'
			]
			'jquery2': [
				'/scripts/vendor/jquery-2.1.0.min.js'
			]
			'html5shiv': [
				'/scripts/vendor/html5shiv.js'
			]
			'isotope' : [
			  '/scripts/vendor/isotope-beta2.pkgd.min.js'
			]
			'tiles-immediate' : [
				'/scripts/modules/tiles-immediate.js'
			]

			# Social Media Services
			services:
				googleAnalytics: 'UA-16401713-2'

			# Override getUrl to fetch relevant url for environment
			getUrl: (document) ->
				return @site.url + (document.url or document.get?('url'))

	# Set up collections to query and sort documents.
	collections:
		# The homepage collection to bring up all content, ordered by date.
		homepage: (database) ->
			options =
				relativeOutDirPath:
					$in: [
						'article'
						'careers'
						'people'
					]
				layout:
					$nin: ['content']
			return database.findAllLive(options, [{sticky: -1, date: -1}]).on "add", (model) ->
				model.setMetaDefaults({sticky: false})

		# Create a collection for each available tag.
		careers: (database) ->
			database.findAllLive
				tags:
					$has: 'careers'
				layout:
					$nin: ['content']
				, {date: -1}
		design: (database) ->
			options = {
				tags:
					$has: 'design'
				layout:
					$nin: ['content']
			}
			return database.findAllLive(options, [{date: -1}])
		people: (database) ->
			database.findAllLive
				tags:
					$has: 'people'
				layout:
					$nin: ['content']
				, {date: -1}
		business: (database) ->
			database.findAllLive
				tags:
					$has: 'business'
				layout:
					$nin: ['content']
				, {date: -1}
		technology: (database) ->
			database.findAllLive
				tags:
					$has: 'technology'
				layout:
					$nin: ['content']
				, {date: -1}
		culture: (database) ->
			database.findAllLive
				tags:
					$has: 'culture'
				layout:
					$nin: ['content']
				, {date: -1}
		events: (database) ->
			database.findAllLive
				tags:
					$has: 'events'
				layout:
					$nin: ['content']
				, {date: -1}
		work: (database) ->
			database.findAllLive
				tags:
					$has: 'work'
				layout:
					$nin: ['content']
				, {date: -1}
		company: (database) ->
			database.findAllLive
				tags:
					$has: 'company'
				layout:
					$nin: ['content']
				, {date: -1}

		# Rendered content into individual segmented HTML pages.
		content: (database) ->
			database.findAllLive({relativeOutDirPath: $in: ['people', 'article', 'careers']}).on "add", (model) ->
				model.setMetaDefaults({additionalLayouts: ['content']})

		# Navigation menu.
		menu: (database) ->
			database.findAllLive
				menu:
					$gt: 0
				layout:
					$ne: 'content-tiles'
				, {menu: 1}

	plugins:

		# Provide the tagged pages
		tags:
			extension: '.html'
			injectDocumentHelper: (document) ->
				tag = document.get('tag')
				name = tag.charAt(0).toUpperCase() + tag.slice(1)
				meta = {
					layout: 'articles'
					# isPaged: true
					# collection: tag
					# pageSize: 999999
					pagedCollection: 'homepage'
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
					# Set url on dev environment to be root
					url: ''
					# Disable certain services on the development environment.
					services:
						googleAnalytics: false
