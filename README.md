# Frok info

This version of LeafletPlayback focuses on component reusability, so it is stripped from all dependencies except jQuery and LeafLet.

There are three leaflet controls defined in `src/Controls.js`: 

1. L.Playback.DateControl - Current tick date/time;
2. L.Playback.PlayControl -  Play/stop button to control time flow of LeafletPlayback;
3. L.Playback.SliderControl - Simple time slider;


# Leaflet Playback (recallfx)

Leaflet Playback provides the ability to replay GPS Tracks in the form of GeoJSON objects. Rather than simply animating a marker along a polyline, the speed of the animation is synchroized to a clock. The playback functionality is similar to a video player--you can start and stop playback, change the playback speed, load GPS tracks, as well as set the playback time with a slider or calendar/time-picker widget.

## Examples

### [Example 0](http://recallfx.github.io/LeafletPlayback/examples/example_0.html)

Basic example of LeafletPlayback plugin, that pre-loads some GPS GeoJSON tracks and lets you play them back.

### [Example 1](http://recallfx.github.io/LeafletPlayback/examples/example_1.html)

Use vis.js timeline as slider control

## GPS Data Format

Leaflet Playback consumes GPS tracks in the form of GeoJSON. The next feature to be implemented for the plugin is the added ability to parse GPX tracks as well. The schema of the GeoJSON data is as follows: 

```javascript
{
  "type": "Feature",
  "geometry": {
    "type": "MultiPoint",
    "coordinates": [/*array of [lng,lat] coordinates*/]
  },
  "properties": {
    "time": [/*array of UNIX timestamps*/]
  }
}
```

Other attributes may be added to the GeoJSON object, but this is the required minimum schema for the plug-in to work.

GeoJSON tracks can be added dynamically to Leaflet Playback by calling:

```javascript
playback.addTracks(tracks);
```

## Usage

### Options

```javascript
var options = {
    tracksLayer: true, // Show tracks checkbox (default true)
    playControl: false, // Show play/stop button (default false)
    dateControl: false, // Show date label (default false)
    sliderControl: false, // Show input range (slider) (default false)
    
    marker : {}, // marker options passed to every marker constructor
    maxInterpolationTime: 5*60*1000 // Max interpolation time (default 5 minutes), anything more will not be interpolated
};
```

### LeafletPlayback setup

```javascript
var playback = new L.Playback(map, data, onPlaybackTick, options);
```

Where `map` is your Leaflet map object, `data` is a GeoJSON object or an array of GeoJSON objects, and `onPlaybackTick(timestamp)` is a function you feed it that will send the `timestamp` value on each tick. 



## Authors and Contributors
This is a @recallfx fork of @hallahan LeafletPlayback plugin.
