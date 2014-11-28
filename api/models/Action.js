/**
* Action.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	//id of user that did the action
  	owner: 'string',
  	type: 'string',
  	text: 'string',
  	public: {
  		type: 'boolean',
  		defaultsTo: false
  	}
  }
};

