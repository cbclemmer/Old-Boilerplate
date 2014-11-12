/**
* Groupp.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	name: 'string',
  	handle: 'string',
  	location: 'string',
  	//private, open, request etc.
  	type: 'string',
  	//only hold first 50(in alphabetical order)
  	members: 'array'
  }
};

