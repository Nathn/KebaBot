const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

const kebabSchema = new mongoose.Schema({
	user: {
		type: String,
		trim: true,
		required: true
	},
	datetime: {
        type: Date,
        default: Date.now
    }
});

kebabSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Kebab', kebabSchema);
