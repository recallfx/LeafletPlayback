$(function() {
    // create time line

    // setup timeline
    var timeline = new links.Timeline(document.getElementById('timeline'), {
      "width":  "100%",
      "height": "120px",
      "style": "box",
      "axisOnTop": true,
      "showCustomTime":true
    });

    var startTime = new Date(demoTracks[0].properties.time[0]);
    var endTime = new Date(demoTracks[0].properties.time[demoTracks[0].properties.time.length - 1]);

    var timelineData = [{ 'start': startTime, 'end': endTime, 'content': 'Test interval' }];
    
    // Draw our timeline with the created data and options
    timeline.draw(timelineData);
    timeline.setCustomTime(startTime);

    // set timechange event, so cursor is set after moving current time (blue)
    links.events.addListener(timeline, 'timechange', onCustomTimeChange);    
    function onCustomTimeChange(properties) {
        if (!playback.isPlaying()){
            playback.setCursor(properties.time.getTime());
        }        
    }


    // setup leaflet map
    var map = new L.Map('map');

    var basemapLayer = new L.TileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom : 18,
        id: 'examples.map-i86knfo3'
    });

    // centers map and default zoom level
    map.setView([44.61131534, -123.4726739], 9);

    // adds the background layer to the map
    map.addLayer(basemapLayer);

    
    // setup playback
    playback = new L.Playback(map, demoTracks, playbackCallback, {
        tracksLayer : true,
        
        playControl: true,
        dateControl: true,
        sliderControl: true,
        
        marker: {}, // marker customisation (icon...)
        
    });
    
    // callback so timeline is set after changing playback time
    function playbackCallback (ms) {
        timeline.setCustomTime(new Date(ms));
    };
    
});
