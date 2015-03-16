Digital Library Changelog
*13.03.2015*


Location : 144.6.226.216


**Summary**

* Map no longer jumps about

* Can search by map area using button

* Bounding boxes crossing the date line display *correctly* as two boxes

* First draft of facet appearance and use.  Still broken functionality so don’t try yet :)


**Changelog**

* Turn off the crazy map panning to include only relevant results when mouse over as it was psychedelic and drove people crazy.  Functionality still exists for potential later use.

* Prevent zooming of the map with scroll wheels as can cause UX problems.

* Add markers and bounding box objects to map layers that can be added, removed or edited programmatically.  Not exposed in UI yet.

* Dealing with bounding boxes crossing the meridian

* Add map based search button and functionality, needs fixes to UI element(user readable significant digits) and intersection with bounding boxes which are not currently shown due to anti-meridian issues (see above and issue 12 https://github.com/vecnet/dl-discovery/issues/12)

* Add highlighting to bounding box on user mouse over of map or search result element

* Add first draft of facets to home page search, needs user feedback on UX.


