module.exports = {
	'hostname': 'mongodb://127.0.0.1',
	'port': '27017',
	'db': 'test',
	'options': {
		db: {
			native_parser: true
		},
		server: {
			auto_reconnect: true,
			poolSize: 5
		}
	}
};