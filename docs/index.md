# Boiler Docs    
  
This is the docs for the boiler remote application framework.  
This application is meant to be used entirely separate from the top-level app and the only thing that you have to do is configure it and CDN the script on your html page to use features and functions.  

## contents    
- [Backend](backend.html)  
- [Frontend](frontend.html)

##Things to do
###groups
- do settings for groups
- add something to add yourself to a group depending on the privacy setting
- let the group type be selected from a dropdown in the settings tab
- let a group have admins

###Posts
- the keep first 30 post ids in the users JSON
- allow self posts, to be either public or private. Targeted posts are always public
- change the public/private setting to default public/private post
- restrict certain types of posts to certain users

###policies
- add policy to make users and posts show able only to those who can view them

###core
- redis
- make user/show just user.ejs

###Backend
- add markdown posting
- make privacy for users work
- collect the first one 50 friend IDs
- be able to delete posts and users
- make sure a group cannot take a user's username for it's handle and vise versa
- allow users to have different types(admin, teacher, boss etc.) and a heiarchy

###Frontend
- delete post text after submitting
- check box for if you want a slug
- create some sort of admin page
- change the private checkbox to a dropdown
