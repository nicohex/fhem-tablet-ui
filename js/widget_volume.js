var widget_volume = {
  _volume: null,
  elements: null,
  drawDial: function () {
  	var c = this.g, // context
	a = this.arc(this.cv), // Arc
	r = 1;

	c.lineWidth = this.lineWidth;
	c.lineCap = this.lineCap;
	if ((this.o.mode>>0) % 2 != 0)
		this.o.bgColor='hsl('+ this.cv +',50%,50% )';
	if (this.o.bgColor !== "none") {
		c.beginPath();
		c.strokeStyle = this.o.bgColor;
		c.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true);
		c.stroke();
	}
	
	var tick_w = (2 * Math.PI) / 360;
	var step =  (this.o.max - this.o.min) / this.angleArc;
	var acAngle = ((this.o.isValue - this.o.min) / step) + this.startAngle;
	var dist = this.o.tickdistance || 4;
	
	// draw ticks
	for (tick = this.startAngle; tick < this.endAngle + 0.00001; tick+=tick_w*dist) {
		i = step * (tick-this.startAngle)+this.o.min;
		
		c.beginPath();
		
		if ((this.o.mode>>1) % 2 != 0){
			// draw ticks in hue color
			c.strokeStyle = 'hsl('+ i +',50%,50% )';  
		}
		else {
			// draw normal ticks
			c.strokeStyle = this.o.tkColor;//'#4477ff';
		}
		
		// thicker lines every 5 ticks
		if ( Math.round(i*10)/10 % 5 == 0 ){ 
			w = tick_w*2;
			w *= (c.strokeStyle != this.o.tkColor) ? 1.5 : 1; 
		}
		else {
			w = tick_w;
			w *= (c.strokeStyle != this.o.tkColor) ? 2 : 1;
		}
		// thicker lines every at current value
		//if (acAngle > tick-tick_w && acAngle < tick+tick_w)
			//w *= 1.9;	
			
		c.arc( this.xy, this.xy, this.radius, tick, tick+w , false);
		c.stroke();
	}

	// draw selection cursor
	c.beginPath();
	if ((this.o.mode>>2) % 2 != 0)
		this.o.hdColor='hsl('+ this.cv +',50%,50% )';
		
	c.strokeStyle = this.o.hdColor;
	c.lineWidth = this.lineWidth * 2;
	c.arc(this.xy, this.xy, this.radius-this.lineWidth/2, a.s, a.e, a.d);
	c.stroke();

  return false;
},
  init: function () {
  	_volume=this;
  	_volume.elements = $('div[data-type="volume"]');
 	_volume.elements.each(function(index) {
		var knob_elem =  jQuery('<input/>', {
			type: 'text',
			value: '10',
		}).appendTo($(this));
		
		var device = $(this).data('device');
		$(this).data('get', $(this).data('get') || 'STATE');
		
		var mode=0; //no hue colors
		var hdDefaultColor='#aa6900';
		if ($(this).hasClass('hue-back')){
			mode = mode | 1<<0;
			hdDefaultColor='#cccccc'; 
		}
		if ($(this).hasClass('hue-tick')){
			mode = mode | 1<<1; 
			hdDefaultColor='#bbbbbb';
		}
		if ( $(this).hasClass('hue-front')){
			mode = mode | 1<<2; 
		}

		knob_elem.knob({
			'min': $(this).data('min') || 0,
			'max': $(this).data('max') || 70,
			'height':$(this).hasClass('small')?100:150,
			'width':$(this).hasClass('small')?100:150,
			'angleOffset': $(this).data('angleoffset') || -120,
			'angleArc': $(this).data('anglearc') || 240,
			'bgColor': $(this).data('bgcolor') || 'transparent',
			'fgColor': $(this).data('fgcolor') || '#cccccc',
			'tkColor': $(this).data('tkcolor') || '#696969',
			'hdColor': $(this).data('hdcolor') || hdDefaultColor,
			'thickness': .25,
			'tickdistance': ((mode>>1) % 2 != 0)?4:20,
			'mode': mode,
			'cursor': 6,
			'reading': $(this).data('set') || '',
			'draw' : _volume.drawDial,
			'change' : function (v) { 
				  startInterval();
			},
			'release' : function (v) { 
				  if (ready){
				  		setFhemStatus(device, this.o.reading + ' ' + v);
				  		$.toast('Set '+ device + ' ' + this.o.reading + ' ' + v );
				  		this.$.data('curval', v);
				  }
			}	
		});
	 });
  },
  update: function (dev,par) {

	var deviceElements;
	if ( dev == '*' )
		deviceElements= _volume.elements;
	else
   		deviceElements= _volume.elements.filter('div[data-device="'+dev+'"]');

	deviceElements.each(function(index) {
		if ( $(this).data('get')==par || par =='*'){	
			var val = getDeviceValue( $(this), 'get' );
			if (val){
				var knob_elem = $(this).find('input');
				if ( knob_elem.val() != val ){
					knob_elem.val( val ).trigger('change');
					DEBUG && console.log( 'volume dev:'+dev+' par:'+par+' change:valve to ' +val );
				}
				knob_elem.css({visibility:'visible'});	
			}
		}
	});
   }
			 
};