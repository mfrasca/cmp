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

function load_computo() {
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
        { tipo: 'relativo',
          qq: 1,
          ln: 1.0,
        },
    ];

    $.each(computo, function(index, linea) {
        var id_linea = "l" + (10000 + index).toFixed(0).substr(1) + "-00";
        var lineadicomputo = $("<div/>", { id: id_linea,
                                           class: "lineadicomputo",
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
                                                   value: linea[what]});
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
}

// to be called at document ready!
function init() {

    // ---------------------------
    // initialize global variables

    // open the communication socket!!!
    socket = io.connect(window.location.href);

    $(document).keypress(function(e) {
        var selected = $(".selected");
        if(e.key==='Up') {
            if($(selected).prev().length) {
                $(selected).prev().addClass("selected");
                $(selected).removeClass("selected");
            }
        } else if(e.key==='Down') {
            if($(selected).next().length) {
                $(selected).next().addClass("selected");
                $(selected).removeClass("selected");
            }
        } else if(e.ctrlKey) {
            var circledDiv = $(".selected").children(".tipolinea");
            if(e.charCode===99)
                choose($(circledDiv).children("[lettera='.codice']"));
            else if(e.charCode===100)
                choose($(circledDiv).children("[lettera='.descrizione']"));
            else if(e.charCode===102)
                choose($(circledDiv).children("[lettera='.fattori']"));
            else if(e.charCode===114)
                choose($(circledDiv).children("[lettera='.relativo']"));
            e.preventDefault();
        }


    });
    load_computo();
}
