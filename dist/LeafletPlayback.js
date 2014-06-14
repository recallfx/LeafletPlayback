L.Playback = L.Playback || {};

L.Playback.Util = L.Class.extend({
  statics: {

    DateStr: function(time) {
      return new Date(time).toDateString();
    },

    TimeStr: function(time) {
      var d = new Date(time);
      var h = d.getHours();
      var m = d.getMinutes();
      var s = d.getSeconds();
      var tms = time / 1000;
      var dec = (tms - Math.floor(tms)).toFixed(2).slice(1);
      var mer = 'AM';
      if (h > 11) {
        h %= 12;
        mer = 'PM';
      } 
      if (h === 0) h = 12;
      if (m < 10) m = '0' + m;
      if (s < 10) s = '0' + s;
      return h + ':' + m + ':' + s + dec + ' ' + mer;
    },

    ParseGPX: function(gpx) {
      var geojson = {
        type: 'Feature',
        geometry: {
          type: 'MultiPoint',
          coordinates: []
        },
        properties: {
          time: [],
          speed: [],
          altitude: []
        },
        bbox: []
      };
      var xml = $.parseXML(gpx);
      var pts = $(xml).find('trkpt');
      for(var i=0, len=pts.length; i<len; i++){
        var p = pts[i];
        var lat = parseFloat(p.getAttribute('lat'));
        var lng = parseFloat(p.getAttribute('lon'));
        var timeStr = $(p).find('time').text();
        var eleStr = $(p).find('ele').text();
        var t = new Date(timeStr).getTime();
        var ele = parseFloat(eleStr);

        var coords = geojson.geometry.coordinates;
        var props = geojson.properties;
        var time = props.time;
        var altitude = geojson.properties.altitude;

        coords.push([lng,lat]);
        time.push(t);
        altitude.push(ele);
      }
      return geojson;
    }
  }

});

L.Playback = L.Playback || {};

L.Playback.MoveableMarker = L.Marker.extend({

  initialize: function (startLatLng) {
    L.Marker.prototype.initialize.call(this, startLatLng, {
    });

    this.bindPopup('');
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
    this._popup.setContent(this._latlng.toString());
  }
});

L.Playback = L.Playback || {};

L.Playback.TickPoint = L.Class.extend({

        initialize : function (geoJSON, tickLen) {
            tickLen = tickLen || 250;
            this._geoJSON = geoJSON;
            this._tickLen = tickLen;
            this._ticks = [];

            var sampleTimes = geoJSON.properties.time;
            var samples = geoJSON.geometry.coordinates;
            var currSample = samples[0];
            var nextSample = samples[1];
            var t = currSampleTime = sampleTimes[0]; // t is used to iterate through tick times
            var nextSampleTime = sampleTimes[1];
            var tmod = t % tickLen; // ms past a tick time
            var rem,
            ratio;

            // handle edge case of only one t sample
            if (sampleTimes.length === 1) {
                if (tmod !== 0)
                    t += tickLen - tmod;
                this._ticks[t] = samples[0];
                this._startTime = t;
                this._endTime = t;
                return;
            }

            // interpolate first tick if t not a tick time
            if (tmod !== 0) {
                rem = tickLen - tmod;
                ratio = rem / (nextSampleTime - currSampleTime);
                t += rem;
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
            } else {
                this._ticks[t] = currSample;
            }

            this._startTime = t;
            t += tickLen;
            while (t < nextSampleTime) {
                ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
                this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                t += tickLen;
            }

            // iterating through the rest of the samples
            for (var i = 1, len = samples.length; i < len; i++) {
                currSample = samples[i];
                nextSample = samples[i + 1];
                t = currSampleTime = sampleTimes[i];
                nextSampleTime = sampleTimes[i + 1];

                tmod = t % tickLen;
                if (tmod != 0 && nextSampleTime) {
                    rem = tickLen - tmod;
                    ratio = rem / (nextSampleTime - currSampleTime);
                    t += rem;
                    this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                } else {
                    this._ticks[t] = currSample;
                }

                t += tickLen;
                while (t < nextSampleTime) {
                    ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime);
                    this._ticks[t] = this._interpolatePoint(currSample, nextSample, ratio);
                    t += tickLen;
                }
            }

            // the last t in the while would be past bounds
            this._endTime = t - tickLen;
            this._lastTick = this._ticks[this._endTime];

        },

        _interpolatePoint : function (start, end, ratio) {
            try {
                var delta = [end[0] - start[0], end[1] - start[1]];
                var offset = [delta[0] * ratio, delta[1] * ratio];
                return [start[0] + offset[0], start[1] + offset[1]];
            } catch (e) {
                console.log('err: cant interpolate a point');
                console.log(['start', start]);
                console.log(['end', end]);
                console.log(['ratio', ratio]);
            }
        },

        getFirstTick : function () {
            return this._ticks[this._startTime];
        },

        getLastTick : function () {
            return this._ticks[this._endTime];
        },

        getStartTime : function () {
            return this._startTime;
        },

        getEndTime : function () {
            return this._endTime;
        },

        getTickMultiPoint : function () {
            var t = this.getStartTime();
            var endT = this.getEndTime();
            var tickLen = this._tickLen;
            var coordinates = [];
            var time = [];
            while (t <= endT) {
                time.push(t);
                coordinates.push(this.tick(t));
                t += this._tickLen;
            }

            return {
                type : 'Feature',
                geometry : {
                    type : 'MultiPoint',
                    coordinates : coordinates
                },
                properties : {
                    time : time
                }
            };
        },

        tick : function (ms) {
            if (ms > this._endTime)
                ms = this._endTime;
            if (ms < this._startTime)
                ms = this._startTime;
            return this._ticks[ms];
        }

    });
L.Playback = L.Playback || {};

L.Playback.Tick = L.Class.extend({

        initialize : function (map, tickPoints) {
            this._map = map;
            if (tickPoints instanceof Array) {
                this._tickPoints = tickPoints;
            } else {
                this._tickPoints = [tickPoints];
            }
            this._markers = [];
            for (var i = 0, len = this._tickPoints.length; i < len; i++) {
                var firstLngLat = this._tickPoints[i].getFirstTick();
                var latLng = new L.LatLng(firstLngLat[1], firstLngLat[0]);
                this._markers[i] = new L.Playback.MoveableMarker(latLng).addTo(map);
            }
        },

        addTickPoint : function (tickPoint, ms) {
            this._tickPoints.push(tickPoint);
            var lngLat = tickPoint.tick(ms);
            var latLng = new L.LatLng(lngLat[1], lngLat[0]);
            this._markers.push(new L.Playback.MoveableMarker(latLng).addTo(this._map));
        },

        tock : function (ms, transitionTime) {
            for (var i = 0, len = this._tickPoints.length; i < len; i++) {
                var lngLat = this._tickPoints[i].tick(ms);
                var latLng = new L.LatLng(lngLat[1], lngLat[0]);
                this._markers[i].move(latLng, transitionTime);
            }
        },

        getStartTime : function () {
            var earliestTime = this._tickPoints[0].getStartTime();
            for (var i = 1, len = this._tickPoints.length; i < len; i++) {
                var t = this._tickPoints[i].getStartTime();
                if (t < earliestTime)
                    earliestTime = t;
            }
            return earliestTime;
        },

        getEndTime : function () {
            var latestTime = this._tickPoints[0].getEndTime();
            for (var i = 1, len = this._tickPoints.length; i < len; i++) {
                var t = this._tickPoints[i].getEndTime();
                if (t > latestTime)
                    latestTime = t;
            }
            return latestTime;
        },

        getMarkers : function () {
            return this._markers;
        }

    });
L.Playback = L.Playback || {};

L.Playback.Clock = L.Class.extend({

  initialize: function (tickObj, callback, options) {
    this._tickObj = tickObj;
    this._callbacksArry = [];
    if (callback) this.addCallback(callback);
    L.setOptions(this, options);
    this._speed = this.options.speed;
    this._tickLen = this.options.tickLen;
    this._cursor = tickObj.getStartTime();
    this._transitionTime = this._tickLen / this._speed;
  },

  options: {
    tickLen:    250,
    speed:      1
  },

  _tick: function (self) {
    if (self._cursor > self._tickObj.getEndTime()) {
      clearInterval(self._intervalID);
      return;
    }
    self._tickObj.tock(self._cursor, self._transitionTime);
    self._callbacks(self._cursor);
    self._cursor += self._tickLen;
  },

  _callbacks: function(cursor) {
    var arry = this._callbacksArry;
    for(var i=0, len=arry.length; i<len; i++){
      arry[i](cursor);
    }
  },

  addCallback: function(fn) {
    this._callbacksArry.push(fn);
  },

  start: function () {
    if (this._intervalID) return;
    this._intervalID = window.setInterval(
      this._tick, 
      this._transitionTime, 
      this);
  },

  stop: function () {
    if (!this._intervalID) return;
    clearInterval(this._intervalID);
    this._intervalID = null;
  },

  getSpeed: function() {
    return this._speed;
  },

  isPlaying: function() {
    return this._intervalID ? true : false;
  },

  setSpeed: function (speed) {
    this._speed = speed;
    this._transitionTime = this._tickLen / speed;
    if (this._intervalID) {
      this.stop();
      this.start();
    }
  },

  setCursor: function (ms) {
    var time = parseInt(ms);
    if (!time) return;
    var mod = time % this._tickLen;
    if (mod !== 0) {
      time += this._tickLen - mod;
    }
    this._cursor = time;
    this._tickObj.tock(this._cursor, 0);
    this._callbacks(this._cursor);
  },

  getTime: function() {
    return this._cursor;
  },

  getStartTime: function() {
    return this._tickObj.getStartTime();
  },

  getEndTime: function() {
    return this._tickObj.getEndTime();
  },

  getTickLen: function() {
    return this._tickLen;
  }

});

// Simply shows all of the track points as circles.
// TODO: Associate circle color with the marker color.
//       Show relevent data about point in popup.

L.Playback = L.Playback || {};

L.Playback.TracksLayer = L.Class.extend({
    initialize : function (map, tracks) {
        this.layer = new L.GeoJSON(tracks, {
                pointToLayer : function (geojson, latlng) {
                    var circle = new L.CircleMarker(latlng, {
                            radius : 5
                        });
                    // circle.bindPopup(i);
                    return circle;
                }
            });

        var overlayControl = {
            '<i class="icon-bullseye"></i> GPS Tracks' : this.layer
        };

        L.control.layers(null, overlayControl, {
            collapsed : false
        }).addTo(map);
    }

});
L.Playback = L.Playback || {};

L.Playback.Control = L.Control.extend({
        options : {
            position : 'bottomleft'
        },

        initialize : function (playback) {
            this.playback = playback;
        },

        onAdd : function (map) {
            this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');

            var self = this;
            var playback = this.playback;
            var startTime = playback.getStartTime();

            var datetime = L.DomUtil.create('div', 'datetime', this._container);

            // date time
            this._date = L.DomUtil.create('p', '', datetime);
            this._time = L.DomUtil.create('p', '', datetime);

            this._date.innerHTML = L.Playback.Util.DateStr(startTime);
            this._time.innerHTML = L.Playback.Util.TimeStr(startTime);


            // slider
            this._slider = L.DomUtil.create('input', 'slider', this._container);
            this._slider.type = 'range';
            this._slider.min = playback.getStartTime();
            this._slider.max = playback.getEndTime();
            this._slider.value = playback.getTime();

            var stop = L.DomEvent.stopPropagation;

            L.DomEvent
            .on(this._slider, 'click', stop)
            .on(this._slider, 'mousedown', stop)
            .on(this._slider, 'dblclick', stop)
            .on(this._slider, 'click', L.DomEvent.preventDefault)
            //.on(this._slider, 'mousemove', L.DomEvent.preventDefault)
            .on(this._slider, 'change', onSliderChange, this)
            .on(this._slider, 'mousemove', onSliderChange, this);

            function onSliderChange(e) {
                var val = Number(e.target.value);
                playback.setCursor(val);
                //time.innerHTML(new Date(val).toString());

                self._date.innerHTML = L.Playback.Util.DateStr(val);
                self._time.innerHTML = L.Playback.Util.TimeStr(val);
            }

            playback.addCallback(function (ms) {
                self._date.innerHTML = L.Playback.Util.DateStr(ms);
                self._time.innerHTML = L.Playback.Util.TimeStr(ms);
                self._slider.value = ms;
            });

            return this._container;
        },

        _loadTracks : function (jsonString) {
            var tracks = JSON.parse(jsonString);
            self.playback.addTracks(tracks);
            self.playback.tracksLayer.layer.addData(tracks);
        }

    });

L.Playback = L.Playback.Clock.extend({
        statics : {
            MoveableMarker : L.Playback.MoveableMarker,
            TickPoint : L.Playback.TickPoint,
            Tick : L.Playback.Tick,
            Clock : L.Playback.Clock,
            Util : L.Playback.Util,
            TracksLayer : L.Playback.TracksLayer,
            Control : L.Playback.Control
        },

        options : {
            tracksLayer : true,
            control : true
        },

        initialize : function (map, geoJSON, callback, options) {
            L.setOptions(this, options);
            this.map = map;
            this.geoJSON = geoJSON;
            this.tickPoints = [];
            if (geoJSON instanceof Array) {
                for (var i = 0, len = geoJSON.length; i < len; i++) {
                    this.tickPoints.push(new L.Playback.TickPoint(geoJSON[i], this.options.tickLen));
                }
            } else {
                this.tickPoints.push(new L.Playback.TickPoint(geoJSON, this.options.tickLen));
            }
            this.tick = new L.Playback.Tick(map, this.tickPoints);
            L.Playback.Clock.prototype.initialize.call(this, this.tick, callback, this.options);
            if (this.options.tracksLayer) {
                this.tracksLayer = new L.Playback.TracksLayer(map, geoJSON);
            }
            if (this.options.control) {
                this.control = new L.Playback.Control(this);
                this.control.addTo(map);
            }
        },

        addTracks : function (geoJSON) {
            console.log('addTracks');
            console.log(geoJSON);
            var newTickPoint = new L.Playback.TickPoint(geoJSON, this.options.tickLen);
            this.tick.addTickPoint(newTickPoint, this.getTime());
            $('#time-slider').slider('option', 'min', this.getStartTime());
            $('#time-slider').slider('option', 'max', this.getEndTime());
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