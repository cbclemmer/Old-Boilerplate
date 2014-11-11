/**
* Objekt.js
*
* @description :: Yes, I screwed up and put object the first time, which is obviosly a keyword... oops
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	//the post that owns it
  	owner: 'string',
  	//what kind: short, clear, markdown, image, video, link, etc.
  	type: 'string',
  	//in what order does it appear in the post
  	order: 'integer',
    //text of the thing
    text: 'string',
  	//source of the file or link
  	source: 'string'
  }
};

