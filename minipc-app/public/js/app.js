require(["nes"], function(nes) {
    // Creo gli oggetti per le serie temporali
    var total = new TimeSeries();
    var user = new TimeSeries();
    var system = new TimeSeries();
    var client = new nes.Client('ws://192.168.0.39:8000');

    client.connect(function(err) {

        var handler = function(data, flags) {
            console.log(data);
            if (data.topic === "0013a20040aded7d") {
                if (data.data === "BTN=0")
                    $(".led-yellow").addClass("off");
                else
                    $(".led-yellow").removeClass("off");
            }
            if (data.topic === "0013a20040c5cabe") {
                if (data.data === "BTN=0")
                    $(".led-green").addClass("off");
                else
                    $(".led-green").removeClass("off");
            }
            if (data.topic === "0013a20040c5caa9") {
                if (data.data === "BTN=0")
                    $(".led-blue").addClass("off");
                else
                    $(".led-blue").removeClass("off");
            }
            if (data.topic === "0013a20040ba9198") {
                if (data.data === "BTN=0")
                    $(".led-red").addClass("off");
                else
                    $(".led-red").removeClass("off");
            }
        };

        client.subscribe('/item/5', handler, function(err) {});
    });

    // Avvio la funzione di aggiornamento dei grafici ogni 500ms
    setInterval(function() {
        // Utilizzo la web api per ottenere il carico della cpu corrente
        fetch('currentLoad')
            .then(function(response) {
                if (!response.ok)
                    throw Error(response.statusText);
                return response.json();
            })
            .then(function(responseAsJson) {
                // Risolte le promises aggiungo l'elemento alla serie temporale
                total.append(new Date().getTime(), responseAsJson.total);
                user.append(new Date().getTime(), responseAsJson.user);
                system.append(new Date().getTime(), responseAsJson.system);
            })
            // In caso di errore scrivo 'error' in console
            .catch(function(error) {
                console.error('Looks like there was a problem: \n', error);
            });
    }, 500);
    // Al caricamento della pagina..
    $(function() {
        // ..creo l'oggetto grafico..
        var chartLoad = new SmoothieChart({ responsive: true, millisPerPixel: 54, interpolation: 'linear', grid: { strokeStyle: 'rgba(211,211,211,0.47)', sharpLines: true, verticalSections: 6 }, tooltip: true, maxValue: 100, minValue: 0 });
        // ..aggiungo le serie temporali..
        chartLoad.addTimeSeries(total, { lineWidth: 1.3, strokeStyle: '#00ff00', fillStyle: 'rgba(0,255,0,0.30)' });
        chartLoad.addTimeSeries(user, { lineWidth: 1.3, strokeStyle: '#0080ff', fillStyle: 'rgba(0,128,255,0.30)' });
        chartLoad.addTimeSeries(system, { lineWidth: 1.3, strokeStyle: '#ff0000', fillStyle: 'rgba(255,0,0,0.30)' });
        // ..avvio lo stream dei dati
        chartLoad.streamTo(document.getElementById("cpu-usage-chart"), 500);
    });
});