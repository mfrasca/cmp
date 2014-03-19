// this javascript element is part of bauble.classic
// http://github.com/mfrasca/bauble.classic

// bauble.classic is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 2 of the
// License, or (at your option) any later version.

// bauble.classic is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with bauble.classic.  If not, see
// <http://www.gnu.org/licenses/>.


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

function choose(obj, letter) {
// make the line at obj be of obj type
//
// obj is one of the 4 circled letters, CDFR. if hit, the letter becomes
// bold and the content of the line will match the chosen letter.

    $(obj.parentElement.children).removeClass('chosen');
    $(obj).addClass('chosen');
    var linea = $(obj.parentElement.parentElement);
    $(linea).children('.shown').addClass("hidden");
    $(linea).children('.shown').removeClass("shown");
    $(linea).children(letter).addClass("shown");
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
        }



    });

}
