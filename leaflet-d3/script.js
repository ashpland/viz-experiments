var map = L.map('map').setView([49.25594425452594, -123.1227826179464], 11);

const baseTileUrl = "https://api.mapbox.com/styles/v1/opengb/ck5my9rac1j1k1io3qtz1z5tc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3BlbmdiIiwiYSI6ImNrNXI0N3F0ZzA5N3Izc202MjE3djJ4bXkifQ.GLXBm-avEKLlZEmWL0EwIw"

L.tileLayer(baseTileUrl).addTo(map);

showOnMap = true;

    const showHidePanes = (shouldHide) => {
        const panes = Object.entries(map.getPanes())
            .map(kv => kv[1])
        panes.splice(3, 1);
        panes.splice(0, 1);
        panes.map(p => p.style.opacity = shouldHide ? 0 : 1);
    };
    const disableMap = () => {
        showHidePanes(true);
        map._handlers.map(h => h.disable());
        document.getElementsByClassName("leaflet-control-container")[0].style.display = "none";
    };

    const enableMap = () => {
        showHidePanes(false);
        map._handlers.map(h => h.enable());
        document.getElementsByClassName("leaflet-control-container")[0].style.display = "inherit";
    }

enableMap();




function loadJSONFile(callback) {   

    var xmlobj = new XMLHttpRequest();

    xmlobj.overrideMimeType("application/json");

    xmlobj.open('GET', 'vancouver-properties.json', true); // Provide complete path to your json file here. Change true to false for synchronous loading.

    xmlobj.onreadystatechange = function () {
          if (xmlobj.readyState == 4 && xmlobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xmlobj.responseText);
          }
    };

    xmlobj.send(null);  
 }


function tryD3(properties) {
    const ghgs = properties.map(p => p["total-ghg"]);

    L.svg().addTo(map)

    const overlay = d3.select(map.getPanes().overlayPane)

    const svg = overlay.select('svg');

    const color = d3.scaleQuantize()
        .domain([Math.min(...ghgs), 800])
        .range(["#265c85", "#518f77", "#d6b647", "#dc6b37", "#a52f2f"]);

    const markers = svg
        .selectAll("property")
        .data(properties)
        .enter()
        .append("circle")
        // .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        // .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
        .attr("r", 7)
        .style("fill", d => color(d["total-ghg"]))
        .style("stroke", "white");

    const x = d3.scaleLinear()
        .domain([Math.min(...ghgs), Math.max(...ghgs)])
        .range([20, 640]);

    const zoomUpdate = () =>

        markers
            .attr("cx", d => 
                map.latLngToLayerPoint([d.latitude, d.longitude]).x)
            .attr("cy", d => 
                map.latLngToLayerPoint([d.latitude, d.longitude]).y);

    update = () => {
        if (showOnMap) {
            enableMap();

            markers
                .transition()
                .duration(2000)
                .attr("cx", d => 
                    map.latLngToLayerPoint([d.latitude, d.longitude]).x)
                    .attr("cy", d => 
                        map.latLngToLayerPoint([d.latitude, d.longitude]).y);
        } else {
            disableMap();

            markers
                .transition()
                .duration(2000)
                .attr("cx", d => x(d["total-ghg"]))
                .attr("cy", 500);
        }

    }

    map.on("zoomend", zoomUpdate)

    swap = () => {
        showOnMap = !showOnMap
        update()
    }

    markers
        .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y);


    document.getElementById("show-map")
        .addEventListener("click", () => {
            showOnMap = true;
            update();
        });

    document.getElementById("show-line")
        .addEventListener("click", () => {
            showOnMap = false;
            update();
        });


}




loadJSONFile(function(response) {
    const properties = JSON.parse(response);
    tryD3(properties)
});



