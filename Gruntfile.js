module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      noDeps: {
        src: [
          'src/Util.js', 
          'src/MoveableMarker.js',
          'src/TickPoint.js',
          'src/Tick.js',
          'src/Clock.js',
          'src/TracksLayer.js',
          'src/Control.js',
          'src/Playback.js'
        ],
        dest: 'dist/LeafletPlayback.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
};
