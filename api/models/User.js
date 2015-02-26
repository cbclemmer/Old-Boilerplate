/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	schema: false,
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
		},
		//all the groups that the user is an admin of
		gAdmin: 'array',
		//if anyone can post
		randomPost: {
			type: 'boolean',
			defaultsTo: 'false'
		},
		//changes the default post: true, public; false: private
		dPublic: {
			type: 'boolean',
			defaultsTo: 'false'	
		},
		confirmed: {
			type: 'boolean',
			defaultsTo: 'false'
		},
		confirmationCode: 'string'
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

