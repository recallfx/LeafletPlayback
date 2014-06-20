
L.Playback = L.Playback.Clock.extend({
        statics : {
            MoveableMarker : L.Playback.MoveableMarker,
            TickPoint : L.Playback.TickPoint,
            Tick : L.Playback.Tick,
            Clock : L.Playback.Clock,
            Util : L.Playback.Util,
            
            TracksLayer : L.Playback.TracksLayer,
            PlayControl : L.Playback.PlayControl,
            DateControl : L.Playback.DateControl,
            SliderControl : L.Playback.SliderControl
        },

        options : {
            tracksLayer : true,
            
            playControl: false,
            dateControl: false,
            sliderControl: false,
            
            marker : {}, // marker options
            maxInterpolationTime: 5*60*1000 // 5 minutes
        },

        initialize : function (map, geoJSON, callback, options) {
            L.setOptions(this, options);
            this.map = map;
            this.geoJSON = geoJSON;
            this.tickPoints = [];
            if (geoJSON instanceof Array) {
                for (var i = 0, len = geoJSON.length; i < len; i++) {
                    this.tickPoints.push(new L.Playback.TickPoint(geoJSON[i], this.options));
                }
            } else {
                this.tickPoints.push(new L.Playback.TickPoint(geoJSON, this.options));
            }
            this.tick = new L.Playback.Tick(map, this.tickPoints, this.options);
            L.Playback.Clock.prototype.initialize.call(this, this.tick, callback, this.options);
            if (this.options.tracksLayer) {
                this.tracksLayer = new L.Playback.TracksLayer(map, geoJSON);
            }

            if (this.options.playControl) {
                this.playControl = new L.Playback.PlayControl(this);
                this.playControl.addTo(map);
            }

            if (this.options.sliderControl) {
                this.sliderControl = new L.Playback.SliderControl(this);
                this.sliderControl.addTo(map);
            }

            if (this.options.dateControl) {
                this.dateControl = new L.Playback.DateControl(this);
                this.dateControl.addTo(map);
            }

        },

        addTracks : function (geoJSON) {
            console.log('addTracks');
            console.log(geoJSON);
            var newTickPoint = new L.Playback.TickPoint(geoJSON, this.options);
            this.tick.addTickPoint(newTickPoint, this.getTime());
            
            this.map.fire('playback:add_tracks');
        }
    });

L.Map.addInitHook(function () {
    if (this.options.playback) {
        this.playback = new L.Playback(this);
    }
});

L.playback = function (map, geoJSON, callback, options) {
    return new L.Playback(map, geoJSON, callback, options);
}