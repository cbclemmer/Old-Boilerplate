# Front end  
## app.jquery.js
###Functions
**showErr(s)** this takes a string and displays it at the top of the screen for 1.5 seconds in a red box and white text, used when something goes wrong  
  
**showInfo(s)** same thing as showErr, just with a green box
    
---
## app.angular.js
this is the main frontend script it houses all the functions for the user such as logging in, out, and friend request type things.  
###Pages  
**Login:** this is the login screen. 
`if you are already authenticated it takes you to the feed screen`  
 
**Feed:** this is used to display a feed of content (Follows: Authenticate).
  
**Settings:** used to house settings page (Follows: Authenticate).

**Messages:** for messages, 
`possible upgrade to use only part of screen and not all`

###Controllers
####userController
 this controller is responsible for the widest variety of things including signing in and out friend requests and forms  
 *The `$scope.use.foo` is used for use with `ng-controller="userController as use"`*  
  
**initialization:**  
  
- Uses the `$http.get("/user/get")` function to check whether the user is authenticated or not.    
- Makes sure that this page is not dynamic and does not already have information if it does then it does not pass the `res` back in to `$rootScope`  
- Checks the private checkbox
- Sets `$rootScope.auth` to `true`
- Gets the users friends
- Gets the users friend requests
  
**$scope.temp** houses signup credentials accessed in html by  
`userController.temp.foo`
  
**$scope.tLogin** houses login credentials accessed in html by  
`userController.tLogin.foo`
  
**this.login** logs the user in using `/session/create` from the parameters:  
`$scope.tLogin.email` and `$scope.tLogin.password`  
and then goes to the `feed` UI  
    
**this.signup** signs the user up using `/user/create` from the parameters in:  
`$scope.temp.username`, `$scope.temp.name`, `$scope.temp.email`, and `$scope.temp.password` after making sure `$scope.temp.password` and `$scope.temp.cPassword` are the same string for verification purposes(Not really important if verification is hacked...)  
  
**$scope.use.logOut** logs the user out using `/session/destroy?load=f`, no questions asked without refreshing page  
  
**this.cPassword** changes the password in the settings page using `/user/private` from the parameters:  
`$scope.temp.nPassword` and `$scope.cnPassword` using `$scope.temp.cPassword` as your current password for authentication  

**this.private** this sets whether the user is private or not using `/user/private` and the value of the `#privateChk` checkbox.  
***Caution** this function is buggy so urge users to only use it once per login or it might not view properly...*
  
**$scope.use.addFriend** adds a friend request to the other persons `$rootScope.user.frJSON` array using `/user/addFriendRequest/`

**$scope.use.deleteRequest**  
description: deletes a friend request of the current user  
server function: `/user/deleteRequest`  
parameter(s): `user` (id passed in by function parameter)  
  

**$scope.use.rFriend**  
description: deletes a friend  
server function: `/user/rFriend`  
parameter(s): `id` (id passed in by function parameter)

---
##app.angular.post.js
###postController
***$scope.post** is used with `ng-controller="postController as post"`*

####Variables
**$scope.postInc:** the increment of posts to know where to start when using the `$scope.post.feed` function  
  
**$scope.post.temp:** used in creating a post, holds all the post JSON  
   
**$scope.post.temp.objekts:** array holds all the objekts(things in post like md, images, etc.)
  
**$scope.post.current:**  the current "objekt" being edited  

**$scope.post.tags:** string array of tags in post

####Functions
**$scope.post.feed:**  
Description: gets the feed designated by the paginator  
Server: `/post/feed`  
Parameter(s): `$scope.postinc` (paginator)  
  
**$scope.post.userFeed:**   
Description: gets one user's feed  
Server: `/post/userFeed`  
Parameters: `user, start  
Result: `$rootScope.posts` is filled or appended
  
**$scope.post.create**  
Description: creates a post  
Server: `/post/create`  
Parameter(s): `$scope.post.tags`,  `$scope.objekts[i].type`  
for short: `$scope.temp.objekts[i].text` (cannot be over 140 characters long)  
  
**$scope.post.lastObj** goes back one objekt with `$scope.post.current`. If there is no text(or picture) in current post then delete post.
  
**$scope.post.addObj** adds empty object with a default of short to `$scope.post.temp.objekts` if the current objekt is not empty
  
**$scope.post.addTag** adds a tag(String) to the `$scope.post.tags` array  

---

##app.angular.search.js
###searchController
**Init:** if this is a dynamic page it sets the user JSON up in `$rootScope.user`  with friends and friend requests  
  
**$scope.search** 
Description: searches for objects  
Server: `/api/search`  
Parameter(s): `s` (the string passed into the function)