L.Playback = L.Playback || {};

L.Playback.Tick = L.Class.extend({

        initialize : function (map, tickPoints, options) {
            L.setOptions(this, options);
        
            this._map = map;
            this._markers = [];
            this._tickPoints = [];

            // initialize tick points
            this.setTickPoints(tickPoints);
        },
        
        clearTickPoints: function(){
            while (this._markers.length > 0){
                var marker = this._markers.pop();
                this._map.removeLayer(marker);
            }
            
            while (this._tickPoints.length > 0){
                this._tickPoints.pop();
            }

        },

        setTickPoints : function (tickPoints){
            // reset current markers
            this.clearTickPoints();

            // return if nothing is set
            if (!tickPoints){
                return;
            }
            
            if (tickPoints instanceof Array) {            
                for (var i = 0, len = tickPoints.length; i < len; i++) {
                    this.addTickPoint(tickPoints[i]);
                }
            } else {
                this.addTickPoint(tickPoints);
            }            
        },
        
        addTickPoint : function (tickPoint, ms) {
            // return if nothing is set
            if (!tickPoint){
                return;
            }
                        
            var lngLat = null;
            
            // if ms is set, then try to get tick at specific time
            if (ms){
                lngLat = tickPoint.tick(ms);
            }
            else {
                lngLat = tickPoint.getFirstTick();
            }
            
            if (lngLat){
                var latLng = new L.LatLng(lngLat[1], lngLat[0]);
               
                this._tickPoints.push(tickPoint);
                this._markers.push(new L.Playback.MoveableMarker(latLng, this.options.marker).addTo(this._map));
            }
        },

        tock : function (ms, transitionTime) {
            for (var i = 0, len = this._tickPoints.length; i < len; i++) {
                var lngLat = this._tickPoints[i].tick(ms);
                var latLng = new L.LatLng(lngLat[1], lngLat[0]);
                this._markers[i].move(latLng, transitionTime);
                //this._markers[i].setLatLng(latLng);
            }
        },

        getStartTime : function () {
            var earliestTime = 0;

            if (this._tickPoints.length > 0){
                earliestTime = this._tickPoints[0].getStartTime();
                for (var i = 1, len = this._tickPoints.length; i < len; i++) {
                    var t = this._tickPoints[i].getStartTime();
                    if (t < earliestTime)
                        earliestTime = t;
                }
            }
            
            return earliestTime;
        },

        getEndTime : function () {
            var latestTime = 0;
        
            if (this._tickPoints.length > 0){
                latestTime = this._tickPoints[0].getEndTime();
                for (var i = 1, len = this._tickPoints.length; i < len; i++) {
                    var t = this._tickPoints[i].getEndTime();
                    if (t > latestTime)
                        latestTime = t;
                }
            }
        
            return latestTime;
        },

        getMarkers : function () {
            return this._markers;
        }

    });