# EntityPermissionViewer
Allows the view of entity permissions tree in Dynamics 365 PCF Control.

Meant to be placed on a view for entity permissions with show only related = false.
You can add filters to the view to remove nodes you do not want to see in network. 

Suggestion is to make the row size 250 which should span all entity permissions in all but the most complicated systems. 

Things that could be added which I have in a more developed web resource would be utility functions to do things such as:
  Highlight all nodes of a certain entity.
  Find the total nodes involved in all paths from entity A to entity B (Used to determine if you will break 10 entity fetch limit)
  Utility to manage changing visulization options on the fly.
