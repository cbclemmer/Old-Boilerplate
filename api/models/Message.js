/**
* Message.js
*
* @description :: This is the actual message that is sent to another user, two copies are kept. One for the sender and one for the recipiant, that way, you can delete one side of your conversation
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	schema: true,

  	attributes: {
  		text: 'string',
  		owner: 'string',
  		conversation: 'string'
  	}
};

