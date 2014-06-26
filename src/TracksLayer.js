// Simply shows all of the track points as circles.
// TODO: Associate circle color with the marker color.

L.Playback = L.Playback || {};

L.Playback.TracksLayer = L.Class.extend({
    initialize : function (map) {
        this.layer = new L.GeoJSON(null, {
            pointToLayer : function (featureData, latlng) {
                var circleOptions = {};
                if (featureData.properties && featureData.properties.path_options){
                    circleOptions = featureData.properties.path_options;
                }
                
                if (!circleOptions.radius){
                    circleOptions.radius = 5;
                }
            
                return new L.CircleMarker(latlng, circleOptions);
            }
        });

        var overlayControl = {
            'GPS Tracks' : this.layer
        };

        L.control.layers(null, overlayControl, {
            collapsed : false
        }).addTo(map);
    },

    // clear all geoJSON layers
    clearLayer : function(){
        for (var i in this.layer._layers){
            this.layer.removeLayer(this.layer._layers[i]);            
        }
    },

    // add new geoJSON layer
    addLayer : function(geoJSON){
        this.layer.addData(geoJSON);
    }
});