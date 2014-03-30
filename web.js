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

var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/test';

var io = require('socket.io').listen(app.listen(port, function() {
            console.log("Listening on " + port);
        }));

io.sockets.on('connection', function (socket) {
    socket.on('load', function(_id) {
        mongo.Db.connect(
            mongoUri, 
            function (err, db) {
                db.collection(
                    'mydocs', 
                    function(er, collection) {
                        collection.findOne(
                            {_id: new ObjectID(_id)},
                            function(er,rs) {
                                console.log(rs);
                                socket.emit('load', rs);
                            });
                    });
            });
    });

    socket.on('save', function(params) {
        console.log(params);
        mongo.Db.connect(
            mongoUri, 
            function (err, db) {
                db.collection(
                    'mydocs', 
                    function(er, collection) {
                        if(params._id) {
                            var _id = new ObjectID(params._id);
                            delete params._id;
                            collection.findAndModify(
                                { _id: _id },
                                null,
                                { $set: params }, 
                                { upsert: true }, 
                                function(er,rs) {
                                });
                        } else {
                            collection.insert(
                                params, 
                                function(er,docs) {
                                    console.log("result from findAndModify", docs);
                                    socket.emit("set_id", docs[0]._id);
                                });
                        }
                    });
            });
    });

    socket.on('find', function(params) {
        mongo.Db.connect(
            mongoUri, 
            function (err, db) {
                db.collection(
                    'mydocs', 
                    function(er, collection) {
                        console.log(params);
                        collection.find(
                            params,
                            {'computo': 0}, // do not want to receive the actual data
                            function(er,rs) {
                                rs.toArray(function(er, docs) {
                                    socket.emit('found', docs);                                    
                                });
                            });
                    });
            });
    });
});
