const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require("../config/db");
const carne = require('../models/carne');
const pao = require('../models/pao');
const opcional = require('../models/opcional');
const status = require('../models/status');
const pedido = require('../models/pedido');
const usuario = require('../models/usuario');

const { autoriza: auth, logados } = require("../midleware/auth");

const Carne = mongoose.model('carnes');
const Pao = mongoose.model('paes');
const Opcional = mongoose.model('opcionais');
const Status = mongoose.model('status');
const Pedido = mongoose.model('pedidos');
const Usuario = mongoose.model('usuarios');

router.post('/login', async(req, res) => {
    const usuario = await Usuario.findOne({login: req.body.login});
    if(usuario) {
        const verifica = await verificaSenha(req.body.senha, usuario.senha);
        if(verifica) {
            const obj = {login: usuario.login, nome: usuario.nome, email: usuario.email, validade: new Date()};
            obj.validade.setMinutes(obj.validade.getMinutes() + 15);
            obj.token = criarHash(usuario._id.toString())
            logados.push(obj);
            res.json({token: obj.token});
        } else {
            res.json({Erro: "Usuário ou Senha incorreta"});
        }
    } else {
        res.json({Erro: "Usuário ou Senha incorreta"});
    }
});

router.get('/logout/:login', auth, async(req, res) => {
    const posicao = logados.findIndex(item => item.login == req.params.login);
    if(posicao > -1) {
        logados.splice(posicao, 1);
        res.json({msg: "Deslogado"});
    } else {
        res.json({Erro: "Usuário não logado"});
    }
});

router.post('/usuario', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const existe = await Usuario.findOne(
            {
                $or: [
                    { login: req.body.login },
                    { name: req.body.name },
                    { email: req.body.email }
                ]
            }
        );

        if(!existe) {
            const novo = new Usuario({
                login: req.body.login,
                nome: req.body.nome,
                email: req.body.email,
                senha: criarHash(req.body.senha)
            });
        
            if(req.body.foto) {
                novo.foto = req.body.foto;
            }
            novo.save();    
            res.json(novo);
        } else {
            console.log(existe);
            res.json({Erro: "Nome de usuário, login ou e-mail ja existe"});
        }
    }
});

router.get('/usuario', auth, async (req, res) => {
    const lst = await Usuario.find();
    if(lst) {
        const resposta = [];
        lst.forEach(element => {
            resposta.push({
                id: element._id,
                login: element.login,
                nome: element.nome,
                email: element.email,
                foto: element.foto
            });
        });
        res.json(resposta);
    } else {
        res.json({Erro: "Nenhum usuário encontrado"});
    }
});

router.put('/usuario', auth, async (req, res) => {
    
});

router.delete('/usuario/:id', auth, (req, res) => {
    const usuario = Usuario.findOne({id: req.params.id});

    Usuario.deleteOne({id: req.params.id})
        .then(() => {
            res.redirect("/usuario");
        })
        .catch((err) => {
            console.log(`Erro ao apagar o usuário ${req.params.id}. ${err}`);
            res.redirect("/usuario");
        });
    }
);

const expiraLogados = () => {
    for(let i = 0; i < logados.length; i++) {
        if(Date.now() > logados[i].validade) {
            logados.splice(i, 1);
        }
    }
};


const criarHash = (senha) => {
    const saltos = 10;
    return(bcrypt.hashSync(senha, saltos));
}

const verificaSenha = (senha, hash) => {
    return(bcrypt.compare(senha, hash));
}

router.get('/carne', auth, async (_, res) => {
    res.json(await carregaCarne());
});

router.get('/carne/:id', auth, async (req, res) => {
    res.json(await carregaCarne(req.params.id));
});

const carregaCarne = async (id = 0) => {
    return(await buscaLista("carne", id));
};

router.post('/carne', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const novo = new Carne(req.body);
        const ultimo = await Carne.findOne().sort({ field: 'asc', id: -1 });
        if(ultimo) {
            novo.id = Number(ultimo.id) + 1;
        } else {
            novo.id = 1;
        }
        novo.save();    
        res.json(novo);
    }
});

router.put('/carne/:id', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const reg = await Carne.findOneAndUpdate(
                {id: req.params.id},
                {tipo: req.body.tipo},
                {new: true}
        );

        if(reg) {
            res.json({id:reg.id, tipo: reg.tipo});
        } else {
            res.json({id:-1, tipo: "Carnes não encontradas."});
        }
    }
});

router.delete('/carne/:id', auth, (req, res) => {
    Carne.deleteOne({id: req.params.id})
        .then(() => {
            res.redirect("/carne");
        })
        .catch((err) => {
            console.log(`Erro ao apagar a carne ${req.params.id}. ${err}`);
            res.redirect("/carne");
        });
    }
);

router.get('/pao', auth, async (_, res) => {
    res.json(await carregaPao());
});

router.get('/pao/:id', auth, async (req, res) => {
    res.json(await carregaPao(req.params.id));
});

const carregaPao = async (id = 0) => {
    return(await buscaLista("pao", id));
};

router.post('/pao', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const novo = new Pao(req.body);
        const ultimo = await Pao.findOne().sort({ field: 'asc', id: -1 });
        if(ultimo) {
            novo.id = Number(ultimo.id) + 1;
        } else {
            novo.id = 1;
        }
        novo.save();    
        res.json(novo);
    }
});

router.delete('/pao/:id', auth, (req, res) => {
    Carne.deleteOne({id: req.params.id})
        .then(() => {
            res.redirect("/pao");
        })
        .catch((err) => {
            console.log(`Erro ao apagar o pão ${req.params.id}. ${err}`);
            res.redirect("/pao");
        });
    }
);

router.get('/opcionais', auth, async (_, res) => {
    res.json(await carregaOpcional());
});

router.get('/opcionais/:id', auth, async (req, res) => {
    res.json(await carregaOpcional(req.params.id));
});

const carregaOpcional = async (id = 0) => {
    return(await buscaLista("opcionais", id));
};

router.post('/opcionais', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const novo = new Opcional(req.body);
        const ultimo = await Opcional.findOne().sort({ field: 'asc', id: -1 });
        if(ultimo) {
            novo.id = Number(ultimo.id) + 1;
        } else {
            novo.id = 1;
        }
        novo.save();    
        res.json(novo);
    }
});

router.delete('/opcionais/:id', auth, (req, res) => {
    Opcional.deleteOne({id: req.params.id})
        .then(() => {
            res.redirect("/opcionais");
        })
        .catch((err) => {
            console.log(`Erro ao apagar o opcional ${req.params.id}. ${err}`);
            res.redirect("/opcionais");
        });
    }
);

router.get('/status', async (_, res) => {
    res.json(await carregaStatus());
});

router.get('/status/:id', auth, async (req, res) => {
    res.json(await carregaStatus(req.params.id));
});

const carregaStatus = async (id = 0) => {
    return(await buscaLista("status", id));
};

router.post('/status', auth, async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const novo = new Status(req.body);
        const ultimo = await Status.findOne().sort({ field: 'asc', id: -1 });
        if(ultimo) {
            novo.id = Number(ultimo.id) + 1;
        } else {
            novo.id = 1;
        }
        novo.save();    
        res.json(novo);
    }
});

router.delete('/status/:id', auth, (req, res) => {
    Status.deleteOne({id: req.params.id})
        .then(() => {
            res.redirect("/status");
        })
        .catch((err) => {
            console.log(`Erro ao apagar o status ${req.params.id}. ${err}`);
            res.redirect("/status");
        });
    }
);

router.get("/ingredientes", async (_, res) => {
    const obj = {
        paes: await buscaLista("pao"), 
        carnes: await buscaLista("carne"), 
        opcionais: await buscaLista("opcionais"),
    };
    
    res.json(obj);
});

router.get("/pedido", auth, async (_, res) => {
    const pedidos = await Pedido.find();
    const lst = [];

    if(pedidos) {
        for(let i = 0; i < pedidos.length; i++) {
            lst.push(await montaObjPedido(pedidos[i]));
        }
    }
    res.json(lst);
});

router.get("/pedido/:id", auth, async (req, res) => {
    const pedido = await Pedido.findOne({id:req.params.id});
    let obj = null;
    if(pedido) {
        obj = await montaObjPedido(pedido);
    }
    res.json(obj);
});

router.post("/pedido", async (req, res) => {
    const id = req.body.id;
    if(!id) {
        const pao =  await Pao.findOne({id: req.body.pao});
        const carne = await Carne.findOne({id: req.body.carne});
        const status = await Status.findOne({id: req.body.status});
        const opcMg = await Opcional.find({id: { $in: req.body.opcionais }});

        const novo = new Pedido();
        const ultimo = await Pedido.findOne().sort({ field: 'asc', id: -1 });
        if(ultimo) {
            novo.id = Number(ultimo.id) + 1;
        } else {
            novo.id = 1;
        }

        req.body.id = novo.id;
        req.body.status = status.tipo;

        novo.nome = req.body.nome;
        novo.pao = pao._id;
        novo.carne = carne._id;
        novo.status = status._id;
        opcMg.forEach(opc => {
            novo.opcionais.push(opc._id)
        });

        novo.save()
            .then(() => {
                res.json(req.body);
            })
            .catch((err) => {
                console.log(`Erro ao criar o pedido. ${err}`);
                res.json(null);
            });
    }
});

router.put("/pedido/:id", auth, async (req, res) => {
    const id = req.params.id;
    if(id) {
        const pedido = await Pedido.findOneAndUpdate({id: id}, req.body);
        res.json(montaObjPedido(pedido));
    }
});

router.patch("/pedido/:id", auth, async (req, res) => {
    const id = req.params.id;

    if(id) {
        const status = await Status.findOne({id: req.body.status});
        const pedido = await Pedido.findOneAndUpdate({id: id}, {status: status._id});
        res.json(montaObjPedido(pedido));
    }
});

router.delete("/pedido/:id", auth, async (req, res) => {
    const id = req.params.id;
    if(id) {
        const pedido = await Pedido.findOneAndDelete({id: id});
        res.json(montaObjPedido(pedido));
    }
});

const montaObjPedido = async (pedido) => {
    const status = await Status.findOne({_id: pedido.status});
    const carne = await Carne.findOne({_id: pedido.carne});
    const pao = await Pao.findOne({_id: pedido.pao});
    const opcMg = await Opcional.find({_id: { $in: pedido.opcionais }});

    const obj = {
        id : pedido.id,
        nome : pedido.nome,
        pao : pao.id,
        carne : carne.id,
        status : status.id,
        opcionais : []
    };

    opcMg.forEach(opc => {
        obj.opcionais.push(opc.id);
    });
    return(obj);
};

const buscaLista = async (tipo, id = 0) => {
    const lista = [];
    try {
        let rst;
        const filtro = id == 0 ? {} : { id: id };
        switch(tipo) {
            case "carne":
                rst = await Carne.find(filtro);
                break;
            case "pao":
                rst = await Pao.find(filtro);
                break;
            case "opcionais":
                rst = await Opcional.find(filtro);
                break;
            case "status":
                rst = await Status.find(filtro);
                break;
        }

        if(rst) {
            rst.forEach(it => lista.push(
                {
                    id: it.id, 
                    tipo: it.tipo
                }
            ));
        }
    } catch(err) {
        console.log(`Erro ao listar ${tipo} ${err}`);
    }

    return(lista);
};

setInterval(expiraLogados, 60000);

module.exports = { router };