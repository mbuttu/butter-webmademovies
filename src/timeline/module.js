/**********************************************************************************

Copyright (C) 2012 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

define( [
          "core/logger", 
          "core/trackevent", 
          "./status-bar",
          "./media-instance",
        ], 
        function( 
          Logger, 
          TrackEvent, 
          StatusBar,
          MediaInstance ){

  var Timeline = function( butter, options ){

    var _target = document.createElement( "div" );
    _target.id = "butter-timeline";
    _target.className = "butter-timeline";
    document.body.appendChild( _target );

    var _statusBar = new StatusBar( butter, _target );

    var _mediaInstances = {},
        _currentMediaInstance;

    this.findAbsolutePosition = function( obj ){
      var curleft = curtop = 0;
      if( obj.offsetParent ) {
        do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
        } while ( obj = obj.offsetParent );
      }
      //returns an array
      return [ curleft, curtop ];
    }; //findAbsolutePosition

    this.moveFrameLeft = function( event ){
      if( butter.targettedEvent ) {
        event.preventDefault();
        var cornOptions = butter.targettedEvent.popcornOptions,
            inc = event.shiftKey ? 2.5 : 0.25;
        if( cornOptions.start > inc ) {
          cornOptions.start -= inc;
          if( !event.ctrlKey && !event.metaKey ) {
            cornOptions.end -= inc;
          }
        } else {
          if( !event.ctrlKey ) {
            cornOptions.end = cornOptions.end - cornOptions.start;
          }
          cornOptions.start = 0;
        }
        butter.targettedEvent.update( cornOptions );
      }
    }; //moveFrameLeft

    this.moveFrameRight = function( event ){
      if( butter.targettedEvent ) {
        event.preventDefault();
        var cornOptions = butter.targettedEvent.popcornOptions,
            inc = event.shiftKey ? 2.5 : 0.25;
        if( cornOptions.end < butter.duration - inc ) {
          cornOptions.end += inc;
          if( !event.ctrlKey && !event.metaKey ) {
            cornOptions.start += inc;
          }
        } else {
          if( !event.ctrlKey ) {
            cornOptions.start += butter.duration - cornOptions.end;
          }
          cornOptions.end = butter.duration;
        }
        butter.targettedEvent.update( cornOptions );
      }
    }; //moveFrameRight

    butter.listen( "mediaadded", function( event ){
      var mediaObject = event.data,
          mediaInstance = new MediaInstance( mediaObject );

      _mediaInstances[ mediaObject.id ] = mediaInstance;
      _target.appendChild( mediaInstance.element );

      function mediaInstanceReady( e ){
        butter.dispatch( "timelineready" );
      } //mediaInstanceReady

      function mediaChanged( event ){
        if ( _currentMediaInstance !== _mediaInstances[ event.data.id ] ){
          _currentMediaInstance && _currentMediaInstance.hide();
          _currentMediaInstance = _mediaInstances[ event.data.id ];
          _currentMediaInstance && _currentMediaInstance.show();
          butter.dispatch( "timelineready" );
        }
      }
    
      function mediaRemoved( event ){
        var mediaObject = event.data;
        if( _mediaInstances[ mediaObject.id ] ){
          _mediaInstances[ mediaObject.id ].destroy();
        }
        delete _mediaInstances[ mediaObject.id ];
        if( _currentMediaInstance && ( mediaObject.id === _currentMediaInstance.media.id ) ){
          _currentMediaInstance = undefined;
        }
        butter.unlisten( "mediachanged", mediaChanged );
        butter.unlisten( "mediaremoved", mediaRemoved );
      } //mediaRemoved

      butter.listen( "mediachanged", mediaChanged );
      butter.listen( "mediaremoved", mediaRemoved );
    });

    this.currentTimeInPixels = function( pixel ){
      if( pixel != null ){
        butter.currentTime = pixel / _currentMediaInstance.container.offsetWidth * _currentMediaInstance.duration;
        butter.dispatch( "mediatimeupdate", _currentMediaInstance.media, "timeline" );
      } //if
      return butter.currentTime / _currentMediaInstance.duration * ( _currentMediaInstance.container.offsetWidth );
    }; //currentTimeInPixels

/*
    this.zoom = function( detail ){
      if( originalWidth === 0 ){
        //in case target is invisible or something first
        originalWidth = _target.offsetWidth;
      }
      if( detail < 0 && currentZoom < 6 ){
        currentZoom++;
      }
       else if ( detail > 0 && currentZoom > 1 ){
        currentZoom--;
      }
      _target.style.width = originalWidth * currentZoom + "px";
      for( var i in _currentMediaInstance.trackLinerTrackEvents ){
        trackLinerEvent = _currentMediaInstance.trackLinerTrackEvents[ i ];
        butterTrackEvent = _currentMediaInstance.butterTrackEvents[ trackLinerEvent.element.id ];
        corn = butterTrackEvent.popcornOptions,
        start = corn.start;
        end = corn.end;
        trackLinerEvent.element.style.width = Math.max( 3, ( end - start ) / _currentMediaInstance.duration * _target.offsetWidth ) + "px";
        trackLinerEvent.element.style.left = start / _currentMediaInstance.duration * _target.offsetWidth + "px";
      }
      return currentZoom;
    }; //zoom
*/
    Object.defineProperties( this, {
      zoom: {
        get: function(){
          return _currentMediaInstace.zoom;
        },
        set: function( val ){
          _currentMedia.zoom = val;
        }
      }
    });

  }; //Timeline

  return Timeline;
}); //define

