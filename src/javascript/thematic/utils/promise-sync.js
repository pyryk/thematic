var PromisePure = function(data) {
	return new Promise(function(resolve, reject) { resolve(data); });
};

module.exports = PromisePure;