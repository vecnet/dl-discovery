Digital Library Changelog
*13.03.2015*



**Changes**

* Turn off the map panning to include only relevant results when mouse over as it was psychedelic and drove people crazy.  Functionality still exists for potential later use.

* Turn off rendering of bounding boxes until some more discussion about data and use are completed.  Makes map marker interaction clearer for the moment.



**Added**

* Prevent zooming of the map with scroll wheels as can cause UX problems.

* Add markers and bounding box objects to map layers that can be added, removed or edited programmatically.  Not exposed in UI yet.

* Add point massaging for bounding boxes that wrap the anti-meridian.  Still requires splitting into single box as per issue.

* Add map based search button and functionality, needs fixes to UI element(user readable significant digits) and intersection with bounding boxes which are not currently shown due to anti-meridian issues (see above and issue 12 https://github.com/vecnet/dl-discovery/issues/12)

* Add highlighting to bounding box on user mouse over of map or search result element

* Add first draft of facets to home page search, needs user feedback on UX.


