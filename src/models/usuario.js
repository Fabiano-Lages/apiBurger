const mongoose = require('mongoose');

mongoose.model("usuarios", new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true
        },
        login: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        senha: {
            type: String,
            required: true
        },
        created: {
            type: Date,
            required: true,
            default: Date.now
        },
        modified: {
            type: Date,
            required: true,
            default: Date.now
        },
        foto: {
            type: String
        }
    }
));