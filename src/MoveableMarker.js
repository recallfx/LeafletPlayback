L.Playback = L.Playback || {};

L.Playback.MoveableMarker = L.Marker.extend({
    
  initialize: function (startLatLng, options) {
    options = options || {};
    L.Marker.prototype.initialize.call(this, startLatLng, options);

    //this.bindPopup('');
  },

  move: function (latLng, transitionTime) {
    // Only if CSS3 transitions are supported
    if (L.DomUtil.TRANSITION) {
      if (this._icon) { 
        this._icon.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear'; 
        if (this._popup && this._popup._wrapper)
          this._popup._wrapper.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear'; 
      }
      if (this._shadow) { 
        this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + transitionTime + 'ms linear'; 
      }
    }
    this.setLatLng(latLng);
    if (this._popup){
        this._popup.setContent(this._latlng.toString());
    }    
  }
});
