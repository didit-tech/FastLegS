var helper = require('../test_helper.js');
var Client = require('../../lib/fast_legs/client');

module.exports = {
	'Surfaces error in the callback when pg connection fails' : function(){
		var client = new Client();
		client.connect();
		client.emit('query', 'Select now();', function(err, result){ assert.isNotNull(err);});
	}
};