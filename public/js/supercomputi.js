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
var filtro;

//
// GLOBAL FUNCTIONS

var currentcolumn;

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

function show_help(quale) {
    var text = {
        cosa: 'cmp è un programma per la gestione di una contabilità lavori, dalla fase preventiva a quella di fatturazione. <br/>a suo tempo, circa 25 anni fa, cmp era un programma scritto in turbo pascal ed utilizzato da due o tre gruppi di geometri a Napoli, ora lo stiamo riscrivendo in forma di software come servizio.<hr/>al momento cmp funziona meglio con firefox, ma anche con chrome ed opera. non ho modo di testarlo né con safari né ie.',
        come: 'in fase inserimento computi:<ul><li>ctrl-k: ->codice</li><li>ctrl-d: ->descrizione</li><li>ctrl-f: ->fattori</li><li>ctrl-r: ->relativo</li><li>ctrl-x: rimuove la linea corrente.</li><li>ctrl-o: inserisce una linea prima di quella corrente.</li><li>ctrl-n: inserisce una linea dopo di quella corrente</li><li>cursore a scendere: prossima linea (o inseriscine una).</li><li>cursore a salire: linea precedente</li><li>tab: prossimo campo</li><li>shift-tab: campo precedente</li></ul>.',
        chi: "questo programma è sviluppato da Mario Frasca, con la consulenza professionale di suo padre Angelo (geometra) e di vari di lui colleghi dell'area napoletana.<br/>è questo il posto per mettere la lista dei collaboratori?<br/>per scrivere all'autore: mario (at) anche (punto) no",
        dove: 'lo sviluppo di cmp è pubblico, <br/>lo puoi seguire su <a target="next_door" href="http://github.com/mfrasca/cmp">http://github.com/mfrasca/cmp</a>. <br/>sempre su github, puoi proporre <a href="http://github.com/mfrasca/cmp/issues" target="next_door">modifiche e migliorie</a>.',
        quando: 'work in progress! :)<br/>i prossimi passi? verifica le <a target="next_door" href="https://github.com/mfrasca/cmp/issues/milestones">pietre miliari</a>.',
    };
     
    $('#help-div').empty();
  
    var elem = $('<div/>');
    elem.html(text[quale]);

    $('#help-div').append(elem);
    $('#helpModal .modal-header h3').text("help - " + quale)
    $('#helpModal').modal('show');
    
}

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

function fireSelectComputo() {
    $("#lista-computi-filtrati").empty();
    $('#selectComputoModal').modal('show');
}

function applyFilterComputo() {
    var computi_filtrati = $("#lista-computi-filtrati");
    $(computi_filtrati).empty();
    var filter = {};
    var label = ['committente', 'cantiere', 'sal', 'nome'];
    for (var f = 0; f<label.length; f++)
        if ($('#filter-' + label[f]).val())
            filter[label[f]] = $('#filter-' + label[f]).val();
    socket.emit('find', filter);
}

function receive_found(params) {
    console.log(params);
    var computi_filtrati = $("#lista-computi-filtrati");
    for (var i = 0; i < params.length; i++) {
        var elem = $("<div/>", { class: 'file-to-select btn',
                                 onclick: "$('#selectComputoModal').modal('hide'); request_computo($(this)); return false;",
                                 value: params[i]._id,
                               });
        elem.text(params[i].nome);
        $(computi_filtrati).append(elem);
    }
}

function save_computo() {
    var result = [];

    $.each($("#computo").children(), function(index, elemento) {
        var linea;
        linea = {};
        linea.tipo = ($(elemento).children(".shown").attr("id").split("-")[3]);
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
    var document = { computo: result,
                     tariffa: $("#computo-tariffa").val(),
                     committente: $("#computo-committente").val(),
                     cantiere: $("#computo-cantiere").val(),
                     sal: $("#computo-sal").val(),
                     nome: $("#computo-nome").val(),
                   };
    if( $("#computo-id").val() )
        document._id = $("#computo-id").val();
    console.log(document);
        
    socket.emit('save', document);
}

function create_linea_di_computo(id_linea, tipocdfr) {
    var lineadicomputo = $("<div/>", { id: id_linea,
                                       class: "lineadicomputo",
                                     });
    var inputsonline;
    $(lineadicomputo).bind('keydown', function(e) {
        var nuovalinea;
        if(e.keyCode===$.ui.keyCode.UP) {
            if($(lineadicomputo).prev().length) {
                inputsonline = $(lineadicomputo).prev().children('.shown').children();
                if($(inputsonline).length > currentcolumn) {
                    $(inputsonline[currentcolumn]).focus();
                } else {
                    $(lineadicomputo).prev().children().children(".getsfocus").focus();
                }
            }
        } else if(e.keyCode===$.ui.keyCode.DOWN) {
            if($(lineadicomputo).next().length === 0) {
                // siamo sull'ultima linea del computo
                var prossimotipodilinea = 'descrizione';
                if ($(lineadicomputo).children('.shown').hasClass('descrizione'))
                    prossimotipodilinea = 'fattori';
                var ultimonumerodilinea = parseInt($(lineadicomputo).attr("id").split('-')[1]);
                var id_linea = "l-" + (10001 + ultimonumerodilinea).toFixed(0).substr(1) + "-00";
                nuovalinea = create_linea_di_computo(id_linea, prossimotipodilinea);
                $(lineadicomputo).parent().append(nuovalinea);
            }
            inputsonline = $(lineadicomputo).next().children('.shown').children();
            if($(inputsonline).length > currentcolumn) {
                $(inputsonline[currentcolumn]).focus();
            } else {
                $(lineadicomputo).next().children().children(".getsfocus").focus();
            }
        } else if(e.ctrlKey) {
            var circledDiv = $(lineadicomputo).children(".tipolinea");
            var selector = false;
            switch(e.keyCode) {
                // 6    7         8         9
                // 56789012345678901234567890
                // abcdefghijklmnopqrtsuvwxyz
            case 75: /* k */ selector = '.codice'; break;
            case 68: /* d */ selector = '.descrizione'; break;
            case 70: /* f */ selector = '.fattori'; break;
            case 82: /* r */ selector = '.relativo'; break;
            case 78: /* n */
            case 79: /* o */
                var beforeThis = $(lineadicomputo);
                if (e.charCode === 110)
                    beforeThis = $(beforeThis).next();
                // TODO interpolare il codice di linea
                nuovalinea = create_linea_di_computo('l-1111-11', 'fattori');
                $(nuovalinea).insertBefore(beforeThis);
                e.preventDefault();
                break;
            case 88: /* x */
                var nextactive = $(lineadicomputo).next();
                if(!$(nextactive).length)
                    nextactive = $(lineadicomputo).prev();
                if(!$(nextactive).length)
                    break;
                $(lineadicomputo).remove();
                $(nextactive).addClass('selected');
                $(nextactive).children().children(".getsfocus").focus();
                e.preventDefault();
                break;
            }
            if (selector !== false){
                choose($(circledDiv).children("[lettera='" + selector + "']"));
                $(lineadicomputo).children(selector).children(".getsfocus").focus();
                e.preventDefault();
            }
        }
    });
    
    var tipolinea = $("<div/>", { class: "tipolinea",
                                  onclick: "$(this).parent().children('.shown').children('.getsfocus').focus();",
                                });
    lineadicomputo.append(tipolinea);
    $.each([{t: 'Ⓒ', l: 'codice',},
            {t: 'Ⓓ', l: 'descrizione',},
            {t: 'Ⓕ', l: 'fattori',},
            {t: 'Ⓡ', l: 'relativo',},
           ], function(ignore, tipo) {
               var elm = $("<div/>", { class: "choose",
                                       lettera: "." + tipo.l,
                                       onclick: "choose(this);",
                                     });
               if (tipocdfr === tipo.l) 
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
                                             });
                   var onfocus = "$('.selected').removeClass('selected');$(this).parent().parent().addClass('selected');";
                   if(j===0)
                       $(input).addClass("getsfocus");
                   switch(elm.part){
                   case 'fattori':
                   case 'relativo':
                       input.addClass('fattore');
                       onfocus += "currentcolumn=" + j + ";$(this).select();";
                       break;
                   case 'descrizione':
                       input.addClass('ds');
                       break;
                   }
                   if(j>0) {
                       $(input).attr('onblur', "check_number($(this), 2);");
                   }
                   if(what==='cod') {
                       $(input).attr('onblur', "lookup_codice($(this));");
                   }                       
                   $(input).attr('onfocus', onfocus);
                   part.append(input);
               });
           });
    var obj = $(lineadicomputo).children("." + tipocdfr);
    obj.removeClass('hidden');
    obj.addClass('shown');

    return lineadicomputo;
}

function lookup_codice(that) {
    var codice = $(that).val();

    socket.emit("lookup", $('#computo-tariffa').val(), codice);
}

function check_number(that, decimals) {
    var value = $(that).val();
    if(value) {
        value = parseFloat(Math.round(value * 100) / 100).toFixed(2);
        $(that).val(value);
    }
}

function create_computo() {
    $("#computo-dettagli input").val("");
    show_computo();
    var lineadicomputo = create_linea_di_computo('l-0000-00', 'codice');
    $("#computo").append(lineadicomputo);
    $("#l-0000-00").children(".shown").children(".getsfocus").focus();
    currentcolumn = 0;
}

function hide_computo() {
    $('#computo-body').removeClass('shown');
    $('#computo-body').addClass('hidden');
}

function show_computo() {
    //$('#editComputoModal').modal('show');
    $("#computo").empty();
    $('#computo-body').addClass('shown');
    $('#computo-body').removeClass('hidden');
}

function request_computo(that) {
    $('#computo').empty();
    socket.emit('load', $(that).attr('value'));
}

function receive_articolo(params) {
    console.log(params);
    if(params) {
        $('#tariffa-descrizione').text(params.descrizione);
        $('#tariffa-udm').text(params.udm);
        $('#tariffa-prezzo').text(params.prezzo);
    }
}

function receive_computo(params) {
    show_computo();
    $("#computo").removeClass('grayed');

    $("#computo-id").val(params._id);
    $("#computo-tariffa").val(params.tariffa);
    $("#computo-committente").val(params.committente);
    $("#computo-cantiere").val(params.cantiere);
    $("#computo-sal").val(params.sal);
    $("#computo-nome").val(params.nome);
    
    $.each(params.computo, function(index, linea) {
        var id_linea = "l-" + (10000 + index).toFixed(0).substr(1) + "-00";
        var lineadicomputo = create_linea_di_computo(id_linea, linea.tipo);
        $("#computo").append(lineadicomputo);
        var obj = $(lineadicomputo).children('.shown');
        switch(linea.tipo) {
        case 'codice':
            obj.children('input').attr({value: linea.codice});
            break;
        case 'descrizione':
            obj.children('input').attr({value: linea.descrizione});
            break;
        case 'fattori':
            obj.children('input.qq').attr({value: linea.qq});
            obj.children('input.ln').attr({value: linea.ln});
            obj.children('input.lr').attr({value: linea.lr});
            obj.children('input.hh').attr({value: linea.hh});
            break;
        case 'relativo':
            obj.children('input.qq').attr({value: linea.qq});
            obj.children('input.ln').attr({value: linea.ln});
            break;
        }
    });
    $("#l-0000-00").children(".shown").children(".getsfocus").focus();
    currentcolumn = 0;
}

function init_socket() {
    socket = io.connect(window.location.href);
    socket.on('lookup', receive_articolo );
    socket.on('load', receive_computo );
    socket.on('connect', console.log('connect'));
    socket.on('disconnect', console.log('disconnect'));
    socket.on('found', receive_found);
    socket.on('set_id', function(new_id) {console.log(new_id); $("#computo-id").val(new_id);});
}

// to be called at document ready!
function init() {

    // ---------------------------
    // initialize global variables

    init_socket();
    hide_computo();
    $(document);
}
