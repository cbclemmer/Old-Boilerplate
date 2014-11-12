/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	schema: true,
  attributes: {
		name: 'string',
		username: 'string',
		private: {
			type: 'boolean',
			defaultsTo: false
		},
		email: {
			type: 'email',
			unique: true,
			required: true
		},
		password: {
			type: 'string',
		},
		online: {
			type: 'boolean',
			defaultsTo: true,
		},
		admin: {
			type: 'boolean',
			defaultsTo: false
		},
		friendRequests: {
			type: 'array'
		},
		requestsSent: {
			type: 'array'
		},
		//only first 30
		groups: {
			type: 'array'
		}
  	},
	beforeCreate: function(values, cb){
		var bcrypt = require('bcrypt');
		bcrypt.hash(values.password, 10, function(err, hash){
			if(err) return cb(err);
			values.password=hash;
			cb();
		});
	}
};

