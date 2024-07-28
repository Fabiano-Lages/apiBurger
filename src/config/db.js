
const mongoose = require("mongoose");
const _Banco = process.env.VUE_APP_API_CONEXAO;

mongoose.Promise = global.Promise;

mongoose.connect(_Banco)
    .then(() => {
        console.log("Banco conectado");
    })    
    .catch((err) => {
        console.log("Erro: " + err);
    });    

const db = mongoose.connection;    

module.exports = { db };