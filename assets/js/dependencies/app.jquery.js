function showErr(s){
	$('#err').empty();
	$('#err').hide();
	$('#err').append(s);
	$('#err').show();
	$('#err').css({marginTop: '-100px'});
	$('#err').animate({marginTop: '10px'}, function(){
			setTimeout(function(){$('#err').fadeOut('fast');}, 1500);
	});
}
$(document).ready(function(){
	$('#err').hide();
});
