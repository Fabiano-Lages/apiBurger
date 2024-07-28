const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const routes = require("./router/routerApi");
const porta = Number(process.env.VUE_APP_API_PORTA);
const app = express(); 

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());
app.use(routes.router);

app.listen(porta, () => {
    console.log(`Aplicativo Make Your Burger escutando na porta ${porta}`);
}); 