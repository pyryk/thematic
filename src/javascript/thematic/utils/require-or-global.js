
function requireOrGlobal(module, variableName) {
	if (variableName === undefined) {
		variableName = module;
	}

	if (window[variableName]) {
		return window[variableName];
	} else {
		return require(module);
	}
}

module.exports = requireOrGlobal;