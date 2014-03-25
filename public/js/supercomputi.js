// this javascript element is part of cmp - contabilita lavori
// http://github.com/mfrasca/cmp

// cmp is free software: you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software
// Foundation, either version 2 of the License, or (at your option) any
// later version.

// cmp is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
// details.

// You should have received a copy of the GNU General Public License along
// with cmp.  If not, see <http://www.gnu.org/licenses/>.


//
// GLOBAL VARIABLES

var socket;

//
// GLOBAL FUNCTIONS

var lastEvent;

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

function choose(obj) {
// make the line at obj be of obj type
//
// obj is one of the 4 circled letters, CDFR. if hit, the letter becomes
// bold and the content of the line will match the chosen letter.

    $(obj).parent().children().removeClass('chosen');
    $(obj).addClass('chosen');
    var linea = $(obj).parent().parent();
    $(linea).children('.cdfr').addClass("hidden");
    $(linea).children('.cdfr').removeClass("shown");
    $(linea).children($(obj).attr("lettera")).addClass("shown");
    $(linea).children($(obj).attr("lettera")).removeClass("hidden");
}

function save_computo() {
    var result = [];

    $.each($("#computo").children(), function(index, elemento) {
        var linea;
        linea = {};
        linea.tipo = ($(elemento).children(".shown").attr("id").split("-")[2]);
        switch(linea.tipo) {
        case "codice":
            linea.codice = $(elemento).children(".codice").children("input").val();
            break;
        case "descrizione":
            linea.descrizione = $(elemento).children(".descrizione").children("input").val();
            break;
        case "fattori":
            linea.qq = $(elemento).children(".fattori").children("input.qq").val();
            linea.ln = $(elemento).children(".fattori").children("input.ln").val();
            linea.lr = $(elemento).children(".fattori").children("input.lr").val();
            linea.hh = $(elemento).children(".fattori").children("input.hh").val();
            break;
        case "relativo":
            linea.qq = $(elemento).children(".relativo").children("input.qq").val();
            linea.ln = $(elemento).children(".relativo").children("input.ln").val();
            break;
        }
        result.push(linea);
    });
    return({computo: result});
}

function load_computo(computo) {
    $("#computo").empty();
    
    $.each(computo, function(index, linea) {
        var id_linea = "l" + (10000 + index).toFixed(0).substr(1) + "-00";
        var lineadicomputo = $("<div/>", { id: id_linea,
                                           class: "lineadicomputo",
                                         });
        $(lineadicomputo).keypress(function(e) {
            if(e.key==='Up') {
                if($(lineadicomputo).prev().length) {
                    $(lineadicomputo).prev().children().children(".getsfocus").focus();
                }
            } else if(e.key==='Down') {
                if($(lineadicomputo).next().length) {
                    $(lineadicomputo).next().children().children(".getsfocus").focus();
                }
            } else if(e.ctrlKey) {
                var circledDiv = $(lineadicomputo).children(".tipolinea");
                switch(e.charCode) {
                case 99:
                    choose($(circledDiv).children("[lettera='.codice']"));
                    $(lineadicomputo).children(".codice").children().focus();
                    break;
                case 100:
                    choose($(circledDiv).children("[lettera='.descrizione']"));
                    $(lineadicomputo).children(".descrizione").children().focus();
                    break;
                case 102:
                    choose($(circledDiv).children("[lettera='.fattori']"));
                    $(lineadicomputo).children(".fattori").children(".qq").focus();
                    break;
                case 114:
                    choose($(circledDiv).children("[lettera='.relativo']"));
                    $(lineadicomputo).children(".relativo").children(".qq").focus();
                    break;
                }
                e.preventDefault();
            }
        });
        
        var tipolinea = $("<div/>", { class: "tipolinea" });
        lineadicomputo.append(tipolinea);
        $.each([{l: 'codice', t: 'Ⓒ'},
                {l: 'descrizione', t: 'Ⓓ'},
                {l: 'fattori', t: 'Ⓕ'},
                {l: 'relativo', t: 'Ⓡ'},
               ], function(ignore, tipo) {
                   var elm = $("<div/>", { class: "choose",
                                           lettera: "." + tipo.l,
                                           onclick: "choose(this);",
                                         });
                   if (linea.tipo === tipo.l) 
                       elm.addClass("chosen");
                   elm.text(tipo.t);
                   tipolinea.append(elm);
               });
        $.each([{ part: 'codice', content: ['cod'] },
                { part: 'descrizione', content: ['desc']},
                { part: 'fattori', content: ['qq', 'ln', 'lr', 'hh'] },
                { part: 'relativo', content: ['qq', 'ln'] },
               ], function(i, elm) {
                   var part = $("<div/>", { id: id_linea + "-" + elm.part,
                                            class: "cdfr hidden " + elm.part });
                   lineadicomputo.append(part);
                   $.each(elm.content, function(j, what) {
                       var input = $("<input/>", { class: what,
                                                   value: linea[what],
                                                   onfocus: "$('.selected').removeClass('selected'); $(this).parent().parent().addClass('selected');",
                                                 });
                       if(j===0)
                           $(input).addClass("getsfocus");
                       switch(elm.part){
                       case 'fattori':
                       case 'relativo':
                           input.addClass('fattore');
                           break;
                       case 'descrizione':
                           input.addClass('ds');
                           break;
                       }
                       part.append(input);
                   });
               });
        $("#computo").append(lineadicomputo);
        var obj = $('#' + id_linea + '-' + linea.tipo);
        obj.removeClass('hidden');
        obj.addClass('shown');
        switch(linea.tipo) {
        case 'codice':
            obj.children('input').attr({value: linea.codice});
            break;
        case 'descrizione':
            obj.children('input').attr({value: linea.descrizione});
            break;
        case 'fattori':
            obj.children('input#qq').attr({value: linea.qq});
            obj.children('input#ln').attr({value: linea.ln});
            obj.children('input#lr').attr({value: linea.lr});
            obj.children('input#hh').attr({value: linea.hh});
            break;
        case 'relativo':
            obj.children('input#qq').attr({value: linea.qq});
            obj.children('input#ln').attr({value: linea.ln});
            break;
        }
    });
    $("#l0000-00").children().children(".getsfocus").focus();
}

function init_socket() {
    socket.on('load', load_computo );
}

// to be called at document ready!
function init() {

    // ---------------------------
    // initialize global variables

    // open the communication socket!!!
    socket = io.connect(window.location.href);

    init_socket();

    $(document)
}
