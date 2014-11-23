module.exports = {
	slug: function(n, un){
		n = n.replace(/^\s+|\s+$/g, ''); // trim
		n = n.toLowerCase();
		// remove accents, swap ñ for n, etc
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		for (var i=0, l=from.length ; i<l ; i++) {
   			n = n.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
  		n = n.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    	.replace(/\s+/g, '-') // collapse whitespace and replace by -
    	.replace(/-+/g, '-'); // collapse dashes
    	n = un+"-"+n;
    	return n;
	}
}