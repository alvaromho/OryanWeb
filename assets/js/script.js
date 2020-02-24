
function click_graficos(){
    $("#boton_volver2").show();
    $("#boton_grafico").hide();
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#graficos").offset().top
    }, 500);
}

function click_volver1(){
    $("#boton_grafico").hide();
}

function click_volver2(){
    $("#boton_volver2").hide();
    $("#boton_grafico").show();
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#resultados").offset().top
    }, 500);
}



function click_resultados(){
    $("#boton_grafico").show();
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#resultados").offset().top
    }, 500);
    //Calcular
    calcular();


}

function calcular() {

    var altura_promedio = limpiar($('#f1').val());
    var volumen_aparente = limpiar($('#f2').val());
    var porcentaje_peso_seco = limpiar($('#f3').val());
    var presion_superficie = limpiar($('#f4').val());
    var rango = limpiar($('#f5').val());


    $('#tabla_resultados').html("");
    var parametros = [];

    var x = 0;
    $('#parametros tr').each(function (a, b) {

        var presion1 = limpiar($('.presion1', b).text());
        var presion2 = limpiar($('.presion2', b).text());
        var densidad = limpiar($('.densidad', b).text());
        var compactacion = limpiar($('.compactacion', b).text());
        if (presion1 !== "" && presion2 !== "" && densidad !== "" && compactacion !== "" && !isNaN(presion1)){

            var tabla = `
             <tr class="hide">
             <td class="pt-3-half presion1" contenteditable="true">` + presion1 + `</td>
             <td class="pt-3-half presion2" contenteditable="true">` + presion2 + `</td>
             <td class="pt-3-half densidad" contenteditable="true">` + densidad + `</td>
             <td class="pt-3-half compactacion" contenteditable="true">` + compactacion + `</td>
             </tr>`;

            $('#tabla_resultados').append(tabla);
            parametros.push({Presion1: presion1, Presion2: presion2, Densidad: densidad, Compactacion: compactacion});
        }
    });
    //alert(parametros.length);


    var iteracion = [];
    iteracion.push({
        Iteracion: 0,
        Presion_promedio: parametros[0]["Presion2"],
        Densidad_verde: parametros[0]["Densidad"],
        Compactacion: 0
    })


    /*alert(presion_superficie);
    alert(parametros[1]["Densidad"]);
    alert(altura_promedio);*/
    var i = 0;
    do{
        if (i === 0){
            var presion_base = presion_superficie + parametros[1]["Densidad"] * altura_promedio;
        }else{
            var presion_base = presion_superficie + iteracion[i]["Densidad_verde"] * altura_promedio;
        }
        //var presion_base = presion_superficie + parametros[1]["Densidad"] * altura_promedio;
        //alert("Presion Base: "+presion_base);
        var presion_promedio = (presion_base + presion_superficie) / 2;
        //alert(presion_promedio);


        try {
            var interpolacion = pendiente(parametros, presion_promedio, presion_base);


            var densidad_granel_verde = interpolacion[0]["Pendiente"] * (presion_promedio - interpolacion[0]["P1"]) + interpolacion[0]["D1"];
            //alert(densidad_granel_verde);
            var densidad_granel_anhidra = porcentaje_peso_seco * densidad_granel_verde;
            //alert(densidad_granel_anhidra);
            var variacion = (densidad_granel_verde - iteracion[i]["Densidad_verde"]) / iteracion[i]["Densidad_verde"];

            var compactacion = (densidad_granel_verde - iteracion[0]["Densidad_verde"]) / iteracion[0]["Densidad_verde"];
            console.log("Densidad a Granel Verde: "+densidad_granel_verde);
            console.log("Densidad verde: "+iteracion[0]["Densidad_verde"]);
            console.log("Compatacion: "+compactacion);

            iteracion.push({
                Iteracion: 1,
                Presion_promedio: presion_promedio,
                Densidad_verde: densidad_granel_verde,
                Densidad_anhidra: densidad_granel_anhidra,
                Variacion: variacion,
                Compactacion: compactacion
            });
        } catch (e) {
            console.log(e);
        }
        i++;
        console.log(variacion*100)
        console.log(rango);
        console.log(variacion*100 < rango);
    } while (variacion*100 > rango);
    var densidad_granel_anhidra = porcentaje_peso_seco * densidad_granel_verde;
    var bdmt = densidad_granel_anhidra * volumen_aparente;

    $('#r1').html(volumen_aparente);        // volumen aparente
    $('#r2').html(densidad_granel_verde.toFixed(3));   /** Falta **/ // densidad a granel verde
    $('#r3').html(porcentaje_peso_seco);    // % peso seco
    $('#r4').html(presion_promedio.toFixed(3));        /** Falta **/ // presion promedio

    $('#r5').html((densidad_granel_anhidra/100).toFixed(3)); // densidad a granel anhidra
    $('#r6').html((bdmt/100).toFixed(3));                    // bdmt
    $('#r7').html((compactacion*100).toFixed(2));            /** Falta **/ // % compactacion

    $('#r8').html(iteracion[iteracion.length-1]["Presion_promedio"].toFixed(3));
    $('#r9').html(iteracion[iteracion.length-1]["Densidad_verde"].toFixed(3));
    $('#r10').html((iteracion[iteracion.length-1]["Densidad_anhidra"]/100).toFixed(3));
    $('#r11').html((iteracion[iteracion.length-1]["Compactacion"]*100).toFixed(3));



    $("#table").find('tbody tr').first().visibility = false;
}

function pendiente(lista, presion, presion_base){
    var largo = lista.length -1;
    var p1 = 0;
    var p2 = 0;
    var d1 = 0;
    var d2 = 0;
    var pendiente = 0;
    var densidad = 0;
    var respuesta = [];


    for (var i = 1; i < largo; i++){
        if (presion <= lista[i+1]["Presion2"] && presion >= lista[i]["Presion2"] ){
            p1 = lista[i]["Presion2"];
            p2 = lista[i+1]["Presion2"];
            d1 = lista[i]["Densidad"];
            d2 = lista[i+1]["Densidad"];

            pendiente =(d2-d1)/(p2-p1);
            //alert(pendiente);
            respuesta.push({Pendiente:pendiente, D1:d1, D2:d2, P1:p1, P2:p2});
            return respuesta;

            //alert("Presion1 "+p1+"\n"+"Presion2 "+p2+"\n"+"Densidad1 "+d1+"\n"+"Densidad2 "+d2)
            //alert(pendiente);
            break;

        }
    }



}

function limpiar(string) {
    return parseFloat(string.replace(",","."));

}




