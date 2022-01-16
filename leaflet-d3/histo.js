// var map = L
//     .map('map')
//     .setView([49.25594425452594, -123.1227826179464], 12)

// L.svg().addTo(map);
// const svg = d3.select(map.getPanes().overlayPane).select('svg');
const svg = d3.select("#graph");
const inset = 50;

const baseTileUrl = "https://api.mapbox.com/styles/v1/opengb/ck5my9rac1j1k1io3qtz1z5tc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3BlbmdiIiwiYSI6ImNrNXI0N3F0ZzA5N3Izc202MjE3djJ4bXkifQ.GLXBm-avEKLlZEmWL0EwIw"

// L.tileLayer(baseTileUrl).addTo(map);

var showOnMap = true;

function init(properties) {
    const ghgs = properties.map(p => p["total-ghg"]);
    const ghgDomain = [Math.min(...ghgs), 800];
    const color = d3.scaleQuantize()
        .domain(ghgDomain)
        .range(["#265c85", "#518f77", "#d6b647", "#dc6b37", "#a52f2f"]);


    // const min = map.containerPointToLayerPoint([
    //     inset, 
    //     window.innerHeight * 0.75]);
    // const max = map.containerPointToLayerPoint([
    //     window.innerWidth - inset,
    //     window.innerHeight * 0.25]);
    
    const min = { "x": inset, "y": window.innerHeight * 0.9 };
    const max = { "x": window.innerWidth - inset, "y": window.innerHeight * 0.1};

    const x = d3.scaleLinear()
        .domain(ghgDomain)
        .range([min.x, max.x]);
    const y = d3.scaleLinear()
        .domain([0, properties.length])
        .range([min.y, max.y]);

    window.x = x;
    window.y = y;

    // const radius = y(properties.length - 1) / 2;
    const radius = 10;

    const nbins = 30;

    const histogram = d3.histogram()
        .domain(ghgDomain)
        .thresholds(x.ticks(nbins))
        .value(d => d["total-ghg"]);

    const bins = histogram(properties);

    const binContainer = svg
        .selectAll("g")
        .data(bins);

    binContainer
        .enter()
        .append("g");

    const calculateMidpoint = (d, x) => {
        return x(d.x0) + (x(d.x1) - x(d.x0)) / 2
    }

    const markers = binContainer
        .selectAll("circle")
        .data(bin => {
            return bin.map((property, index) => {
                return { 
                    "index": index,
                    "value": property["total-ghg"],
                    "xpos":  calculateMidpoint(bin, x),
                    "lat": property.latitude,
                    "lng": property.longitude
                }
            });
        });

    markers
        .enter()
        .append("circle")
        .attr("cx", d => d.xpos)
        .attr("cy", d => y(d.index) - 2 * radius * d.index)
        .attr("r", radius)
        .style("fill", d => color(d.value))
        .style("stroke", "white");
    

};

d3.json("vancouver-properties.json").then(init);
d3.json("vancouver-properties.json").then(init);


    // svg
    //     .selectAll("property")
    //     .data(properties)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
    //     .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
    //     .attr("r", 7)
    //     .style("fill", d => color(d["total-ghg"]))
    //     .style("stroke", "white");


// function tryD3(properties) {


//     const markers = svg
//         .selectAll("property")
//         .data(properties)
//         .enter()
//         .append("circle")
//         // .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
//         // .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y)
//         .attr("r", 7)
//         .style("fill", d => color(d["total-ghg"]))
//         .style("stroke", "white");

//     const zoomUpdate = () =>

//         markers
//             .attr("cx", d => 
//                 map.latLngToLayerPoint([d.latitude, d.longitude]).x)
//             .attr("cy", d => 
//                 map.latLngToLayerPoint([d.latitude, d.longitude]).y);

    
//     const lineScales = () => {
//         const inset = 50;

//         const xMin = map.containerPointToLayerPoint(inset);
//         const xMax = map.containerPointToLayerPoint(window.innerWidth - 2 * inset);
//         const y = map.containerPointToLayerPoint(window.innerHeight / 2);

//         const scales = {
//             x: d3
//             .scaleLinear()
//             .domain([Math.min(...ghgs), 800])
//             .range([xMin, xMax])
//             .clamp(true),
//             y: () => y
//         }
//         return scales;
//     };


//     update = () => {
//         if (showOnMap) {
//             enableMap();

//             markers
//                 .transition()
//                 .duration(2000)
//                 .attr("cx", d => 
//                     map.latLngToLayerPoint([d.latitude, d.longitude]).x)
//                     .attr("cy", d => 
//                         map.latLngToLayerPoint([d.latitude, d.longitude]).y);
//         } else {
//             disableMap();

//             const inset = 50;
//             const min = map.containerPointToLayerPoint([inset, window.innerHeight / 2]);
//             const max = map.containerPointToLayerPoint([window.innerWidth - inset, window.innerHeight / 2]);

//             const x = d3
//                 .scaleLinear()
//                 .domain([Math.min(...ghgs), 800])
//                 .range([min.x, max.x])
//                 // .range([20, 200])
//                 .clamp(true);

//             markers
//                 .transition()
//                 .duration(2000)
//                 .attr("cx", d => x(d["total-ghg"]))
//                 .attr("cy", min.y);
//         }

//     }

//     map.on("zoomend", zoomUpdate)

//     swap = () => {
//         showOnMap = !showOnMap
//         update()
//     }

//     markers
//         .attr("cx", d => map.latLngToLayerPoint([d.latitude, d.longitude]).x)
//         .attr("cy", d => map.latLngToLayerPoint([d.latitude, d.longitude]).y);


//     document.getElementById("show-map")
//         .addEventListener("click", () => {
//             showOnMap = true;
//             update();
//         });

//     document.getElementById("show-line")
//         .addEventListener("click", () => {
//             showOnMap = false;
//             update();
//         });


//             showOnMap = false;
//             update();
// }




// loadJSONFile(function(response) {
//     const properties = JSON.parse(response);
//     tryD3(properties)
// });



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
