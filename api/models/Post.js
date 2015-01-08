/**
* Post.js
*
* @description :: this is the post object that 
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    //the url
    slug: 'string',
    //name of post
    name: 'string',
 	  //the person or group that posted
  	owner: 'string',
  	//username of the person that owns it
  	ownerName: 'string',
  	//the person or group that it is being posted to, same as owner if self post
  	target: 'string',
  	//primary type of post determined by first type inputed, can be edited, can be sorted
  	type: 'string',
  	//array of tage 
  	tags: 'array',
  	//screw you 'likes', we have hearts here :p(or whatever we decide to call them...)
  	hearts: 'integer',
  	//the objects contained in this post. Individual objects are still saved, but all the objects are stored in this container. Subject to change...
  	objekts: 'array',
    //whether you can add another objekt to the post
    closed: 'boolean',
    public: {
      type: 'boolean',
      defaultsTo: false
    },
    numComments: 'integer'
  }
};