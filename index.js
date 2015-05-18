var request = require('request')

module.exports = function(ziggy, settings) {
	ziggy.on('pm', function (user, text) {
		parseCommand(user, null, text)
	})

	ziggy.on('message', function (user, channel, text) {
		parseCommand(user, channel, text)
	})

	function sendHelp(target) {
		ziggy.say(target, 'Usage: !mdn <keyword>')
	}

	function parseCommand(user, channel, text) {
		var target = channel || user.nick

		//ignore messages that don't start with !mdn, only send help if we were pm'd
		if(text.substr(0, 5) !== '!mdn ') {
			if(text.substr(0,4) === '!mdn' || !channel) {
				sendHelp(target)
			}
			return
		}

		var query = text.substr(5).trim()

		if(!query) {
			sendHelp(target)
			return
		}

		getTopResult(query, function(result) {
			if(!result.success) {
				ziggy.say(target, result.error)
				return
			}

			var excerpt = result.result.excerpt
			if(excerpt.indexOf("\n") === -1) {
				excerpt = excerpt.replace(/<mark>|<\/mark>/g, '') + ' '
			} else {
				excerpt = ''
			}
			ziggy.say(target, result.result.title + ': ' + excerpt + result.result.url)
		})
	}

	function getTopResult(query, cb) {
		request.get('https://developer.mozilla.org/en-US/search.json?topic=api&topic=html&topic=js&topic=webdev&q=' + encodeURIComponent(query), function (error, response, body) {
			if (!error && response.statusCode == 200) {
				if(!body) {
					return cb({success: false, error: 'Error when loading MDN results'})
				}

				var results = JSON.parse(body)
				if(!results.count) {
					return cb({success: false, error: 'No MDN results found'})
				}

				return cb({success: true, result: results.documents[0]})
			}
		})
	}
}