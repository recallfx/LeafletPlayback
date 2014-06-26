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

# Usage

## API

### new L.Playback(map, geoJSON, onPlaybackTimeChange, options)

### Options

```javascript
var playback = new L.Playback(map, geoJSON, onPlaybackTimeChange, options);
```

* `map` - LeafLet map object. **Required**.

* `geoJSON` - GeoJSON object or an array of GeoJSON objects. Pass `null` if you don't have any data yet. **Required**.

* `onPlaybackTimeChange` - A function with signature `(timestamp)` that will send the `timestamp` value on each tick. **Required**.

* `options` - An options object. **Optional**.

### options

* `tracksLayer` - Set `true` if you want to show layer control on the map. **Default: `true`**.

* `playControl` - Set `true` if play button is needed. **Default: `false`**.

* `dateControl` - Set `true` if date label is needed. **Default: `false`**.

* `sliderControl` - Set `true` if slider control is needed. **Default: `false`**.

* `marker` - Set leaflet marker options, to extend `L.Playback.MoveableMarker`. Useful for custom icons. **Default: `{}`**.

* `maxInterpolationTime` - Set max interpolation time in seconds. **Default: `5*60*1000` (5 minutes)**.


### playback#setData(geoJSON)

Reset current data and add new.

* `geoJSON` - GeoJSON object or an array of GeoJSON objects. **Required**.

### playback#addData(geoJSON)

Add new data.

* `geoJSON` - GeoJSON object or an array of GeoJSON objects. **Required**.

### playback#clearData()

Clear all data and tracks layer.

## Authors and Contributors
This is a @recallfx fork of @hallahan LeafletPlayback plugin.
