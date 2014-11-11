#Backend

##PostController
### Create
**Description:** makes a new empty post  
**Parameter(s):** `target` (what it is being posted to), `name`, and `tags`  
  
###objCreate
**Description:** makes a new objekt for a post  
**Parameter(s):** `type`, `post` (the post the objekt goes to), `order`, `text`, `source`
    
###feed
**Description:** gets the user's feed  
**Parameter(s):** `start` (where to start the feed(integer))  

###userFeed
**description:** gets the feed for one user  
**Parameter(s):** `user`, `start`  
**Policie(s):** showable
  
###fill
**Description:** gets the objekts in a post  
**Parameter(s):** `post` (what the objekts belong to)  
  
---
