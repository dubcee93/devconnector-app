const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db); //{useNewUrlParser: true} was used in the videos but doesn't seem to be necessary anymore

        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);

        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
