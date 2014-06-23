# Leaflet Playback

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

```javascript
var playback = new L.Playback(map, demoTracks, clockCallback);
```

Where `map` is your Leaflet map object, `demoTracks` is a GeoJSON object or an array of GeoJSON objects, and `clockCallback(timestamp)` is a function you feed it that will send the `timestamp` value on each tick.

### Authors and Contributors
This is a @recallfx fork of @hallahan LeafletPlayback plugin.
