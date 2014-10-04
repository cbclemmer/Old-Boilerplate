function showErr(s){
	console.log(s);
	$('#err').empty();
	$('#err').hide();
	$('#err').append(s);
	$('#err').show();
	$('#err').css({marginTop: '-100px'});
	$('#err').animate({marginTop: '10px'}, function(){
			setTimeout(function(){$('#err').fadeOut('fast');}, 1500);
	});
};
function showInfo(s){
	console.log(s);
	$('#info').empty();
	$('#info').hide();
	$('#info').append(s);
	$('#info').show();
	$('#info').css({marginTop: '-100px'});
	$('#info').animate({marginTop: '10px'}, function(){
			setTimeout(function(){$('#info').fadeOut('fast');}, 1500);
	});
}
$(document).ready(function(){
	$('#err').hide();
	$('#info').hide();
	$("#search").keydown(function(){
		console.log("searching");
		if($('#search').val().length>0){
			angular.element(document.getElementById('searchBar')).scope().search($('#search').val());
		}else{
			$('#searchBar').find("div").remove();
		}
	});
});
