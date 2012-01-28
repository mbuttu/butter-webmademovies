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

define( [ "core/logger", "core/eventmanager", "./trackliner-trackevent" ], function( Logger, EventManager, TrackEvent ){

  var __guid = 0;

  function Track(){

    var _id = "trackliner-track-" + __guid++,
        _events = {},
        _this = this,
        _eventManager = new EventManager( this ),
        _element = document.createElement( "div" ),
        _length = 1,
        _zoom = 1;

    _element.className = "trackliner-track";
    _element.id = _id;

    $( _element ).droppable({ 
      greedy: true,
      // this is dropping an event on a track
      drop: function( event, ui ) {
        var eventId = ui.draggable[ 0 ].id,
            parentId = ui.draggable[ 0 ].parentNode.id;

        if( _id !== parentId ){
          _this.removeTrackEvent( eventId );
        }
        else if( !_events[ eventId ] ){
          _eventManager.dispatch( "trackeventrequested", {
            event: event,
            ui: ui
          });
        } //if
/*
          var rect = _element.getBoundingClientRect();
          track.addTrackEvent( track.createTrackEvent({
              left: ( e.clientX - rect.left ),
              width: 50,
              innerHTML: ui.draggable[ 0 ].innerHTML
            }, true ));
*/
      }
    });

    Object.defineProperties( this, {
      element: {
        enumerable: true,
        configurable: false,
        get: function(){
          return _element;
        }
      },
      trackEvents: {
        enumerable: true,
        configurable: false,
        get: function(){
          return _events;
        }
      },
      zoom: {
        enumerable: true,
        get: function(){
          return _zoom;
        },
        set: function( val ){
          _zoom = val;
          _this.length = _length;
          for( var e in _events ){
            if( _events.hasOwnProperty( e ) ){
              _events[ e ].zoom = val;
            } //if
          } //for
        }
      },
      length: {
        enumerable: true,
        get: function(){
          return _length;
        },
        set: function( val ){
          _length = val;
          _element.style.width = ( _length * _zoom ) + "px";
          for( var e in _events ){
            if( _events.hasOwnProperty( e ) ){
              _events[ e ].length = _length;
            } //if
          } //for
        }
      }
    });

    this.createTrackEvent = function( inputOptions, ui ) {
      var trackEvent = new TrackEvent( inputOptions, ui );
      _this.addTrackEvent( trackEvent, ui );
      return trackEvent;
    }; //createTrackEvent

    this.addTrackEvent = function( trackEvent, ui ) {
      _events[ trackEvent.element.id ] = trackEvent;
      _element.appendChild( trackEvent.element );
      trackEvent.trackId = _id;
      ui = ui || false;
      _eventManager.dispatch( "trackeventadded", {
        track: _this,
        trackEvent: trackEvent,
        ui: ui
      });
      return trackEvent;
    };

    this.updateTrackEvent = function( trackEvent, options ) {
      trackEvent.update( options );
      return trackEvent;
    }; //updateTrackEvent

    this.getTrackEvent = function( id ) {
      return _events[ id ];
    }; //getTrackEvent

    this.removeTrackEvent = function( id ) {
      var trackEvent = _events[ id ];
      delete events[ id ];
      _element.removeChild( trackEvent.element );
      _eventManager.dispatch( "trackeventremoved", trackEvent );
      return trackEvent;
    }; //removeTrackEvent

    this.toString = function() {
      return trackId;
    }; //toString
  }; //Track

  return Track;

});
