var statuses = ['ready', 'loading', 'error'];

var IModule = {
	isThematicModule: true,
	status: 'ready', // by default, status is ready (the case of getting data synchronously)
	scale: function(value) {
		return value; // identity scale as default
	},
	setScale: function(scale) {
		this.scale = scale;
		return this;
	},
	setData: function(data) {
		this.data = data;

		// handle rejected promises
		if (this.data && typeof this.data.then === 'function') {
			this.data.then(null, function(error) {
				console.warn('error fetching data', arguments);
				this.statusChanged('error');
			}.bind(this));
		}

		return this;
	},
	addTo: function(id, thematic) {
		if (typeof this.show !== 'function') {
			throw new Error("Thematic modules must have method show for displaying the data.");
		}

		this.id = id;
		this.map = thematic.map;
		this.thematic = thematic;
		this.show();
		return this;
	},
	statusChanged: function(status) {
		if (statuses.indexOf(status) === -1) {
			console.warn('Unsupported status string', status);
		}
		this.status = status;
		this.thematic.moduleStatusChanged(this.id);
	}
};


module.exports = IModule;