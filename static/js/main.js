$(document).on('ready', function(){
	var socket = io('http://localhost:8000');
	var $name = $('#name');
	var $email = $('#email');
	var $entrada = $('#entrada');
	var $segundo = $('#segundo');
	var $mensaje = $('#mensaje');
	var $enviar = $('#enviar');
	
	var fn = {};

	fn.enviar = function(e){
		$enviar.prop( "disabled", true );
		socket.emit('send', {
			name: $name.val(),
			email: $email.val(),
			entrada: $entrada.val(),
			segundo: $segundo.val(),
			mensaje: $mensaje.val()
		});
	};
	
	$enviar.on('click', fn.enviar);
	
	socket.on('finish', function (data) {
		$enviar.prop( "disabled", false);
		alert(data.message);
	});

});