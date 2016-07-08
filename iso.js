/*
 * iso.js: Javascript backend for calculating ISO Limits and fits.
 * Copyright (C) 2016  Derry Hamilton <derryh@rasilon.net>
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
var scaleWidth;
var scaleHeight;
var leftPattern;
var rightPattern;

function el(id) {
    return document.getElementById(id);
}

function limitFor(size,limitID) {
    var safeSize = parseFloat(size);
    var safeLimitID = parseInt(limitID);
    if(typeof safeSize == 'undefined' || typeof safeLimitID  =='undefined' || safeLimitID > 18) {
        return undefined;
    }
    for(var i = 0; i< limits.length; i++) {
        limit = limits[i];
        if(safeSize > limit.lower_limit && safeSize <= limit.upper_limit) {
            return limit.limits[safeLimitID];
        }
    }
    return parseInt("999999999999");
}

function fitFor(size,fit_id) {
    if(typeof(fit_id) == 'undefined') {
        return undefined;
    }
    var safeSize = parseFloat(size);
    if(typeof safeSize == 'undefined' || typeof fit_id  =='undefined' ) {
        return undefined;
    }

    var fid = fit_id.charAt(0).toLowerCase();
    var fIndex;
    for(var i=0; i<fits_decode.length; i++) {
        if(fits_decode[i] == fid) fIndex = i;
    }

    var boundary;
    for(var i=0; i<fits.length; i++) {
        var fit = fits[i];
        if(safeSize > fit.lower_limit && safeSize <= fit.upper_limit) {
            if(fit_id == "D"){
                //alert("Returning boundary "+fit.fits[fIndex]+" and direction "+fits_direction[fIndex] + "for "+fit_id);
            }
            return {"boundary": fit.fits[fIndex], "direction": fits_direction[fIndex]};
        }

    }

    return undefined;
}

function parseBasis(basisStr) {
    var re = /^([0-9.]*)?([A-Za-z])?([0-9]*)?/;
    var matches = basisStr.match(re);
    if(matches === null) {
        return undefined;
    }
    var sizeStr =  matches[1];
    var size = parseFloat(sizeStr);

    var fitStr = matches[2];
    var fit = fitFor(size,fitStr);

    var limitStr = matches[3];
    var limit = limitFor(size,limitStr);

    var isShaft = (typeof fitStr != "undefined" && fitStr == fitStr.toLowerCase());

    var upperLmit = null;
    var lowerLmit = null;

    if(isShaft) {
        var basicSize = size*1000;
        if(typeof fit != "undefined") {
            basicSize += (fit.boundary * fit.direction);
            var limitSize = basicSize + ( limit * fit.direction);
            upperLimit = Math.max(basicSize,limitSize);
            lowerLimit = Math.min(basicSize,limitSize);
        }

    } else {
        var basicSize = size*1000.0;
        if(typeof fit != "undefined") {
            basicSize -= (fit.boundary * fit.direction);
            var limitSize = basicSize - ( limit * fit.direction );
            upperLimit = Math.max(basicSize,limitSize);
            lowerLimit = Math.min(basicSize,limitSize);
        }
    }
    if(typeof upperLimit == "undefined")return undefined;


    return {
        "basisStr": basisStr, "sizeStr": sizeStr, "size": size,
        "fit_str": fitStr, "fit": fitFor(size,fitStr),
        "limit_str": limitStr, "limit": limitFor(size,limitStr),
        "isShaft": isShaft, "upperLimit": upperLimit , "lowerLimit": lowerLimit
        };

}
function calc(element) {
    var els = [];
    for(var i=1;i<10;i++){
        var el_name = "element_"+i+"_basis";
        var e = el(el_name);
        if(typeof e != "undefined" && e != null) els.push(e);
    }

    var bases = [];

    for(var i =0; i<els.length; i++) {
        var b = parseBasis(els[i].value);
        if(typeof b != "undefined" && typeof b.limit_str != "undefined" && b.limit_str.length > 0) bases.push(b);
    }
    draw_bases(bases);

}


function resize_canvas() {
    canvas = document.getElementById("tutorial");
    canvas.width  = window.innerWidth* 0.5;
    canvas.height = window.innerHeight*0.95;
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        scaleWidth = ctx.canvas.clientWidth/100;
        scaleHeight = ctx.canvas.clientHeight/100;
    }
    calc();

}

function init_page(){
    console.log("Page init");
    var els = [];
    for(var i=1;i<10;i++){
        try{
            var elName = "element_"+i+"_basis";
            var shortElName = "el"+i;
            var param = getParameterByName(elName);
            var shortParam = getParameterByName(shortElName);
            if(param){
                var e = el(elName);
                e.value = param;
            }
            if(shortParam){
                var e = el(elName);
                e.value = shortParam;
            }
        }catch(err){
            console.log(err);
        }
    }
    resize_canvas();

}

function draw_bases(bases) {
    if(typeof bases == "undefined")return;
    if(bases.length == 0)return;

    var canvas = document.getElementById('tutorial');

    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
    }

    var umRangeTop = bases[0].upperLimit;
    var umRangeBottom = bases[0].upperLimit;
    for(var i=0; i<bases.length; i++) {
        umRangeTop = Math.max(umRangeTop,bases[i].upperLimit);
        umRangeBottom = Math.min(umRangeBottom,bases[i].lowerLimit);
    }

    var umRange = umRangeTop - umRangeBottom;
    var umHalfRange = umRange/2;
    var umCanvasTop = umRangeTop + umHalfRange;
    var umCanvasBottom = umRangeBottom - umHalfRange;
    var umCanvasRange = umCanvasTop - umCanvasBottom;
    var pxRange = ctx.canvas.clientHeight/umCanvasRange;
    var pxLeft = 0;
    var pxPerBasis = ctx.canvas.clientWidth/bases.length;



    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0; i<bases.length; i++) {
        var umNominal = bases[i].size * 1000; // we want um, supplied in mm
        var umNomFromTop = umCanvasTop - umNominal;
        var pxNomFromTop = umNomFromTop * pxRange;

        var umUpperFromTop = umCanvasTop - bases[i].upperLimit;
        var pxUpperFromTop = umUpperFromTop * pxRange;
        var umLowerFromTop = umCanvasTop - bases[i].lowerLimit;
        var pxLowerFromTop = umLowerFromTop * pxRange;

        ctx.beginPath();
        ctx.moveTo(pxLeft-10,pxNomFromTop);
        ctx.lineTo(pxLeft+pxPerBasis + 10,pxNomFromTop);
        ctx.stroke();
        ctx.closePath();

        if(bases[i].isShaft) {
            ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
        } else {
            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        }
        ctx.fillRect (pxLeft, pxUpperFromTop, pxPerBasis, pxLowerFromTop - pxUpperFromTop);

        var rightHatch = new Image();
        rightHatch.src = "right_hatch.png";
        var leftHatch = new Image();
        leftHatch.src = "left_hatch.png";

        leftPattern = ctx.createPattern(leftHatch, "repeat");
        rightPattern = ctx.createPattern(rightHatch, "repeat");

        // Alternating hatching.
        if(i%2 == 0){
            ctx.fillStyle = leftPattern;
        }else{
            ctx.fillStyle = rightPattern;
        }

        // Draw the material direction and outline
        if(bases[i].isShaft) {
            ctx.fillRect (pxLeft, pxLowerFromTop, pxPerBasis, canvas.height - pxLowerFromTop); // Shade the zone
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.rect (pxLeft, pxUpperFromTop, pxPerBasis, canvas.height - pxUpperFromTop); // Outline the part
            ctx.stroke();
        }else{
            ctx.fillRect (pxLeft, 0, pxPerBasis, pxUpperFromTop); // Shade the zone
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.rect (pxLeft, 0, pxPerBasis, pxLowerFromTop); // Outline the part
            ctx.stroke();
        }

        ctx.font="14px Michroma";
        ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
        var textOffset = 2;
        var textHeight = ctx.measureText("m").width; // Hacktastic!
        var halfNominalWidthPX = ctx.measureText(bases[i].basisStr).width/2.0;
        var centreLinePX = pxLeft+(pxPerBasis/2);

        ctx.fillText(bases[i].basisStr,centreLinePX - halfNominalWidthPX,pxNomFromTop - textOffset); // Name the nominal
        ctx.fillText((bases[i].upperLimit/1000.0).toFixed(3),pxLeft+10,pxUpperFromTop - textOffset); // Mark the upper limit
        ctx.fillText((bases[i].lowerLimit/1000.0).toFixed(3),pxLeft+10,pxLowerFromTop + textOffset + textHeight); // Mark the lower limit


        pxLeft += pxPerBasis;
    }

}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
