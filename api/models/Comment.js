/**
* Comment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	//the post that owns it
  	owner: 'string',
  	//the user that posted it
  	user: 'string',
  	username: 'string',
  	content: 'string',
  	//parent comment,if highest level comment this is blank
  	parent: 'string',
  	//see post model
  	hearts: 'integer'
  }
};

