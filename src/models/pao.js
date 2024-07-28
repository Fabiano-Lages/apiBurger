const mongoose = require('mongoose');

mongoose.model("paes", new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },
        tipo: {
            type: String,
            required: true
        }
    }
));