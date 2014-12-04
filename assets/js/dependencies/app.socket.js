io.socket.on("message", function(data){
	console.log(data);
	showInfo(data.message);
});