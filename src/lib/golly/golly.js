/* golly.js : v0.0.1 on 09/12/2012
* http://dannygarcia.github.com/golly/
* Copyright (c) 2012 Danny Garcia; Licensed MIT */

/* changes by Ben Fisher 2017:
	add event for resize.
	remove support for mousedrag.
	remove misleading 'key' because it's not actually the key
	etc.
	new options:
		'eatallkeyevents'
		'enablecontextmenu'
*/

// Base
window['GOLLY'] = function(params) {

	if ( !params ) {
		params = {};
	}

	// Do we support canvas?
	if ( !document.createElement('canvas').getContext ) {
		if ( params.fallback ) {
			params.fallback();
		}
		return;
	}

	var _this = this,
		k = 1e3,
		_privateParts =
		{
			'ctx' : undefined,
			'domElement' : undefined,
			'width' : undefined,
			'height' : undefined,
			'desiredFrameTime' : k/60,
			'frameCount' : 0,
			'milliseconds' : 0,
			'pmouseX' : 0,
			'pmouseY' : 0,
			'eatallkeyevents': params['eatallkeyevents'] === true,
			'offset' : {x:0, y:0}
		},
		_actualFrameTime,
		d; // shorthand for the dom element

	var getOffset = function() {
		var obj = d;
		var x = 0, y = 0;
		while (obj) {
			y += obj.offsetTop;
			x += obj.offsetLeft;
			obj = obj.offsetParent;
		}
		_privateParts['offset'].x = x;
		_privateParts['offset'].y = y;
	};

	// Default parameters

	if ( !params['context'] ) {
		params['context'] = '2d';
	}


	// Create domElement, grab context

	d = _privateParts['domElement'] = document.createElement('canvas');
	_privateParts['ctx'] = d.getContext( params['context'] );

	// Are we capable of this context?

	if (_privateParts['ctx'] === null) {
		if ( params.fallback ) {
			params.fallback();
		}
		return;
	}

	// Set up width and height setters / listeners
	
	if ( params['customsizing'] ) {
		// mode introduced by Ben Fisher, 2017.
		var onResize = function() {
			getOffset();
			if (_this['onresize']) {
				return _this['onresize']();
			}
		}
		
		window.addEventListener( 'resize', onResize, false );
		onResize();
		document.body.style.margin = '0px';
		document.body.style.padding = '0px';
		document.body.style.overflow = 'hidden';
		params['container'] = document.body;
		
		_this.__defineSetter__('width', function(v) {
			_privateParts['width'] = d['width'] = v;
		});

		_this.__defineSetter__('height', function(v) {
			_privateParts['height'] = d['height'] = v;
		});
	}
	else if ( params['fullscreen'] ) {

		var onResize = function() {

			getOffset();

			if ( params['width'] ) {
				_privateParts['width'] = d['width'] = params['width'];
			} else {
				_privateParts['width'] = d['width'] = window.innerWidth;
			}

			if ( params['height'] ) {
				_privateParts['height'] = d['height'] = params['height'];
			} else {

				_privateParts['height'] = d['height'] = window.innerHeight;
			}

			if ( !_this.loop ) {
				if ( _this['draw'] ) {
					_this['draw']();
				}
			}
		};

		window.addEventListener( 'resize', onResize, false );
		onResize();

		if ( !params['container'] ) {
			document.body.style.margin = '0px';
			document.body.style.padding = '0px';
			document.body.style.overflow = 'hidden';
		}

		params['container'] = params['container'] || document.body;


	} else {

		if ( !params['width'] ) {
			params['width'] = 500;
		}

		if ( !params['height'] ) {
			params['height'] = 500;
		}



		window.addEventListener( 'resize', getOffset, false );
		getOffset();


		_this.__defineSetter__('width', function(v) {
			_privateParts['width'] = d['width'] = v;
		});

		_this.__defineSetter__('height', function(v) {
			_privateParts['height'] = d['height'] = v;
		});

		_this['width'] = params['width'];
		_this['height'] = params['height'];

	}

	// Put it where we talked about (if we talked about it).

	if ( params['container'] ) {
		if ( params['fnaddtodom'] ) {
			params['fnaddtodom'](params['container'], d);
		} else {
			params['container'].appendChild(d);
		}
		getOffset();
	}

	var getter = function(n) {
		_this.__defineGetter__(n, function() {
			return _privateParts[n];
		});
	};

	// Would love to reduce this to params.

	getter('ctx');
	getter('domElement');
	getter('width');
	getter('height');
	getter('frameCount');
	getter('milliseconds');
	getter('pmouseX');
	getter('pmouseY');

	var no_op = function() {};

	_this['loop'] = true;
	_this['draw'] = no_op;
	_this['onresize'] = no_op;
	_this['keydown'] = no_op;
	_this['keyup'] = no_op;
	_this['mousedown'] = no_op;
	_this['mouseup'] = no_op;
	_this['mousemove'] = no_op;

	// Custom Getters & Setters
	_this.__defineGetter__('frameRate', function(v) {
		return 1E3/_actualFrameTime;
	});

	_this.__defineGetter__('frameTime', function(v) {
		return _actualFrameTime;
	});

	_this.__defineSetter__('frameTime', function(v) {
		_privateParts['desiredFrameTime'] = v;
	});

	_this.__defineSetter__('frameRate', function(v) {
		_privateParts['desiredFrameTime'] = k/v;
	});
	
	// Disable context menu
	if (!params['enablecontextmenu']) {
		_privateParts['domElement'].oncontextmenu = function (e) {
			e.preventDefault();
			return false;
		};
	}

	// Listeners
	window.addEventListener('keydown', function(e) {
		// note -- requires a fairly recent standards-compliant browser
		var keycode = e.code;
		var keychar = e.key;
		var shouldContinue = _this['keydown'](keycode, keychar, e.repeat, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
		if (!shouldContinue && _privateParts['eatallkeyevents']) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		} else {
			return true
		}
	}, false);
	
	window.addEventListener('keyup', function(e) {
		var keycode = e.code;
		var keychar = e.key;
		var shouldContinue = _this['keyup'](keycode, keychar, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
		if (!shouldContinue && _privateParts['eatallkeyevents']) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		} else {
			return true
		}
	}, false);

	_privateParts['domElement'].addEventListener('mousedown', function(e) {
		var x = e.pageX - _privateParts['offset'].x;
		var y = e.pageY - _privateParts['offset'].y;
		var shouldContinue = _this['mousedown'](x, y, e.button, e.buttons, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
	}, false);
	
	_privateParts['domElement'].addEventListener('mouseup', function(e) {
		var x = e.pageX - _privateParts['offset'].x;
		var y = e.pageY - _privateParts['offset'].y;
		var shouldContinue = _this['mouseup'](x, y, e.button, e.buttons, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
	}, false);
	
	_privateParts['domElement'].addEventListener('mousemove', function(e) {
		var x = e.pageX - _privateParts['offset'].x;
		var y = e.pageY - _privateParts['offset'].y;
		var shouldContinue = _this['mousemove'](x, y, e.button, e.buttons, _privateParts['pmouseX'], _privateParts['pmouseY']);
		_privateParts['pmouseX'] = x;
		_privateParts['pmouseY'] = y;
	}, false);

	// Internal loop.
	if (params['trackFrameTime'] === false) {
		_privateParts['_idraw'] = function(milliseconds) {
			_privateParts['milliseconds'] = milliseconds;
			_privateParts['frameCount']++;
			_this['draw']();
			if ( _this['loop'] ) {
				window.requestAnimationFrame( _privateParts['_idraw'] );
			}
		};
		
		_privateParts['_idraw'](performance.now());
		
	} else {
		window.requestAnimationFrame = (function(){
			return window.requestAnimationFrame   ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
		}());

		_privateParts['_idraw'] = function() {
			_privateParts['frameCount']++;
			var prev = new Date().getTime();
			_this['draw']();
			var delta = new Date().getTime() - prev;

			if (delta > _privateParts['desiredFrameTime']) {
				_actualFrameTime = delta;
			} else {
				_actualFrameTime = _privateParts['desiredFrameTime'];
			}

			if ( _this['loop'] ) {
				window.requestAnimationFrame( _privateParts['_idraw'] );
			}
		};
		
		_privateParts['_idraw']();
	}
};
