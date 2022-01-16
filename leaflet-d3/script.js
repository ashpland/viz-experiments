var map = L.map('map').setView([49.25594425452594, -123.1227826179464], 11);

const baseTileUrl = "https://api.mapbox.com/styles/v1/opengb/ck5my9rac1j1k1io3qtz1z5tc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3BlbmdiIiwiYSI6ImNrNXI0N3F0ZzA5N3Izc202MjE3djJ4bXkifQ.GLXBm-avEKLlZEmWL0EwIw"

L.tileLayer(baseTileUrl).addTo(map);

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
    const gfas = properties.map(p => p["gfa"]);

    L.svg().addTo(map)

    const overlay = d3.select(map.getPanes().overlayPane)

    const svg = overlay.select('svg');

    const x = d3.scaleLinear()
        .domain([Math.min(...ghgs), Math.max(...ghgs)])
        .range([0, 460]);

    const y = d3.scaleLinear()
        .domain([Math.min(...gfas), Math.max(...gfas)])
        .range([460, 0]);
    
    const markers = svg
        .selectAll("property")
        .data(properties)
        .enter()
        .append("circle")
        .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
        .attr("r", 7)
        .style("fill", "blue")
        .style("stroke", "black");




    // inner.append('g')
    // .attr("transform", "translate(0," + 460 + ")")
    // .call(d3.axisBottom(x));

    // inner.append('g')
    // // .attr("transform", "translate(0," + 460 + ")")
    // .call(d3.axisLeft(y));


const update = () => markers
        .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y);

    map.on("zoomend", update)
    map.on("moveend", update)

}




loadJSONFile(function(response) {
    const properties = JSON.parse(response);
    tryD3(properties)
});



