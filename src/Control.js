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