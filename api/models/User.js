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
		email: {
			type: 'email',
			unique: true,
			required: true
		},
		password: {
			type: 'string',
			required: true
		},
		online: {
			type: 'boolean',
			defaultsTo: true,
		},
		admin: {
			type: 'boolean',
			defaultsTo: false
		},
		friends: {
			collection: 'User',
			via: 'email'
		},
		friendRequests: {
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

