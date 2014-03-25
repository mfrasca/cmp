// this is the remote server

var express = require("express");
var app = express();
var port = Number(process.env.PORT || 5010);
console.log("will open port " + port);

var fs = require('fs');

String.prototype.formatU = function() {
    var str = this.toString();
    if (!arguments.length)
        return str;
    var args = typeof arguments[0];
    args = (("string" == args || "number" == args) ? arguments : arguments[0]);
    for (var arg in args)
        str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
    return str;
};

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res){
    res.render("accueil");
});

var io = require('socket.io').listen(app.listen(port, function() {
            console.log("Listening on " + port);
        }));

io.sockets.on('connection', function (socket) {
    socket.on('load', function(params) {
        socket.emit('load', computo);
    });

    socket.on('save', function(params) {
        computo = params.computo;
    });
});

var computo = [
    { tipo: 'codice',
      codice: '01 001',
    },
    { tipo: 'descrizione',
      desc: 'descrizione dell\'articolo riferito',
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'descrizione',
      desc: 'descrizione dell\'articolo riferito',
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'descrizione',
      desc: 'descrizione dell\'articolo riferito',
    },
    { tipo: 'fattori',
      qq: 2,
      ln: 1.0,
      lr: 4.0,
      hh: 0.0,
    },
    { tipo: 'fattori',
      qq: 2,
      ln: 1.0,
      lr: 4.0,
      hh: 0.0,
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'codice',
      codice: '01 002',
    },
    { tipo: 'descrizione',
      desc: 'descrizione dell\'articolo riferito',
    },
    { tipo: 'fattori',
      qq: 1,
      ln: 1.0,
      lr: 0.0,
      hh: 0.0,
    },
    { tipo: 'descrizione',
      desc: 'descrizione dell\'articolo riferito',
    },
    { tipo: 'relativo',
      qq: 1,
      ln: 1.0,
    },
];

