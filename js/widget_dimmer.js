var widget_dimmer = {
  _dimmer: null,
  elements: null,
  init: function () {
  	_dimmer=this;
  	_dimmer.elements = $('div[data-type="dimmer"]');
 	_dimmer.elements.each(function(index) {

		var device = $(this).data('device');
		$(this).data('get', $(this).data('get') || 'STATE');
		$(this).data('set', $(this).data('set') || '');
		$(this).data('get-on', $(this).attr('data-get-on') || $(this).attr('data-on') || 'on');
		$(this).data('get-off', $(this).attr('data-get-off') || $(this).attr('data-off') || 'off');
		$(this).data('set-off', $(this).attr('data-set-off') || $(this).data('get-off'));
		var elem = $(this).famultibutton({
			icon: 'fa-lightbulb-o',
			backgroundIcon: 'fa-circle',
			offColor: '#2A2A2A',
			onColor: '#2A2A2A',
			mode: 'dimmer', 
			
			// Called in toggle on state.
			toggleOn: function( ) {
				var v = $(this).data('famultibutton').getValue();
				setFhemStatus(device,$(this).data('set')+' '+v);
			},
			toggleOff: function( ) {
				 setFhemStatus(device,$(this).data('set-off'));
			},
			valueChanged: function(v) {
				localStorage.setItem("dimmer_"+device, v);
				if ($(this).data('famultibutton').getState())
				 setFhemStatus(device,$(this).data('set')+' '+v);
			},
		});
		var val = localStorage.getItem("dimmer_"+device);
		if ( val )
			elem.setValue( parseInt(val));
	 });
  },
  update: function (dev,par) {

	var deviceElements;
	if ( dev == '*' )
		deviceElements= _dimmer.elements;
	else
   		deviceElements= _dimmer.elements.filter('div[data-device="'+dev+'"]');

	deviceElements.each(function(index) {

	 	if ( $(this).data('get')==par || par =='*'){

			var state = getDeviceValue( $(this), 'get' );
			if (state) {
				if ($.isNumeric(state)) $(this).data('famultibutton').setValue( parseInt(state));
				if ( state == $(this).data('get-on') )
					$(this).data('famultibutton').setOn();
				else if ( state == $(this).data('get-off') )
					$(this).data('famultibutton').setOff();
				else if ( state.match(RegExp('^' + $(this).data('get-on') + '$')) )
						$(this).data('famultibutton').setOn();
				else if ( state.match(RegExp('^' + $(this).data('get-off') + '$')) )
						$(this).data('famultibutton').setOff();
			}
		}
	});
   }
			 
};