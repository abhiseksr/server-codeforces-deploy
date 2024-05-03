const mongoose = require('mongoose');
const {Schema} = mongoose;

const privateSchema = Schema({
    username: {
        type: String
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