//= require geoblacklight/geoblacklight
//= require geoblacklight/viewers
//= require geoblacklight/basemaps
//= require geoblacklight/modules
//= require geoblacklight/downloaders
//= require blacklight_range_limit


GeoBlacklight.Viewer.Map = GeoBlacklight.Viewer.Map.extend({
  /**
   * Selects basemap if specified in data options, if not return positron
   */
  selectBasemap: function () {
    var _this = this;
    if (_this.data.basemap) {
      return GeoBlacklight.Basemaps[_this.data.basemap];
    } else {
      return GeoBlacklight.Basemaps.positron;
    }
  }
});
