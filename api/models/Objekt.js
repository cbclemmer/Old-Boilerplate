/**
* Objekt.js
*
* @description :: Yes, I screwed up and put object the first time, which obviosly is a keyword... oops
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	//the post that owns it
  	owner: 'string',
  	//optional
  	name: 'string',
  	//what kind: short, clear, markdown, image, video, link, etc.
  	type: 'string',
  	//in what order does it appear in the post
  	order: 'integer',
  	//source of the file or link
  	source: 'string'
  }
};

