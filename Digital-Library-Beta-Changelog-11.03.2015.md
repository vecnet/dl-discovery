Digital Library Changelog
*11.03.2015*



**Changes**

* Turn off the map panning to include only relevant results when mouse over as it was psychedelic and drove people crazy.  Functionality still exists for potential later use.

* Turn off rendering of bounding boxes until some more discussion about data and user are completed.  Makes map marker interaction clearer for the moment.



**Added**

* Prevent zooming of the map with scroll wheels as sometimes can cause UX problems.

* Add markers and bounding box objects to layers that can be added, removed or edited programmatically

* Add point massaging for bounding boxes that wrap the anti-meridian

* Add map based search button and functionality, needs fixes to UI element and intersection with bounding boxes which are not currently shown due to anti-meridian issues (see issue 12 https://github.com/vecnet/dl-discovery/issues/12)

