const logados = [];

const autoriza = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let retorno;
  let autoriza = false;

if (token) {
    if(verifica(token)) {
      autoriza = true;
    } else {
      retorno = res.sendStatus(403);
    }
} else {
    retorno = res.sendStatus(401);
}

if(autoriza) {
  next();
} else {
  return(retorno);
}
};

module.exports = { autoriza, logados };

const verifica = (token) => {
    return(!!logados.find(user => user.token == token));
};
