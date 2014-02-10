# Myplanet Digital - Content Downloader
#
# Downloads all the content from the Myplanet Digital content repository.
#
# Usage:
#	npm install
#	npm install grunt -g
#	grunt content
#
module.exports = (grunt) ->
	grunt.initConfig
		# Retrieve any information from package.json.
		pkg: grunt.file.readJSON("package.json")
	
		# Clone the content repository.
		gitclone:
			content:
				options:
					repository: 'https://github.com/myplanetdigital/myplanetdigital-content.git'
					directory: 'build/content'

		# Copy the content into th source directory.
		copy:
			content:
				files: [
					{
						expand: true
						cwd: 'build/content/'
						src: '**'
						dest: 'src/'
					}
				]

		# Remove any built files.
		clean:
			content: [
				'build/content'
			]

	grunt.loadNpmTasks 'grunt-git'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-clean'

	grunt.registerTask 'content', ['clean', 'gitclone', 'copy']
	grunt.registerTask 'default', ['content']