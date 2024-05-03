const mongoose = require('mongoose');
const {Schema} = mongoose;

const privateSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function (value) {
            return /^[a-zA-Z0-9_]+$/.test(value);
          },
          message: 'Username can only contain alphanumeric characters and underscores'
        }
    },
    loggedInAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    geoLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

const Private = mongoose.model('Private', privateSchema);
module.exports = Private;