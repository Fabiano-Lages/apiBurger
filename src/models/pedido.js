const mongoose = require('mongoose');

mongoose.model("pedidos", new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true
        },
        nome: {
            type: String,
            required: true
        },
        pao: {
            type: mongoose.Types.ObjectId,
            ref: 'paes',
            required: true
        },
        carne: {
            type: mongoose.Types.ObjectId,
            ref: 'carnes',
            required: true
        },
        opcionais: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'opcionais'
            }
        ],
        status: {
            type: mongoose.Types.ObjectId,
            ref: 'status',
            required: true
        }
    }
));