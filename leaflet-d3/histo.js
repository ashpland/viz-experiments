var map = L
    .map('map')
    .setView([49.25594425452594, -123.1227826179464], 12)

L.svg().addTo(map);
const svg = d3.select(map.getPanes().overlayPane).select('svg');
const minHorizontalInset = 50;
const radius = 5;
const nbins = 30;

const baseTileUrl = "https://api.mapbox.com/styles/v1/opengb/ck5my9rac1j1k1io3qtz1z5tc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3BlbmdiIiwiYSI6ImNrNXI0N3F0ZzA5N3Izc202MjE3djJ4bXkifQ.GLXBm-avEKLlZEmWL0EwIw"

L.tileLayer(baseTileUrl).addTo(map);
map.on("zoomend", updateZoom);

let showOnMap = true;

let ghgDomain;
let x;
let y;
let properties;
let color;

function init(data) {
    properties = data;
    const ghgs = properties.map(p => p["total-ghg"]);
    ghgDomain = [Math.min(...ghgs), 800];
    color = d3.scaleQuantize()
        .domain(ghgDomain)
        .range(["#265c85", "#518f77", "#d6b647", "#dc6b37", "#a52f2f"]);

    x = d3.scaleLinear()
        .domain(ghgDomain)

    y = d3.scaleLinear()
        .domain([0, properties.length])

    updateScales();

    const histogram = d3.histogram()
        .domain(ghgDomain)
        .thresholds(x.ticks(nbins))
        .value(d => d["total-ghg"]);

    const binContainer = svg
        .selectAll("g")
        .data(histogram(properties));

    binContainer
        .enter()
        .append("g");

    const markers = binContainer
        .selectAll("circle")
        .data(bin => {
            return bin.map((property, index) => {
                return { 
                    "index": index,
                    "value": property["total-ghg"],
                    "xpos":  calculateMidpoint(bin, x),
                    "lat": property.latitude,
                    "lng": property.longitude,
                    "id": property["seed-property-id"]
                }
            });
        });

    const setInitialPosition = (markers) => {
        if (showOnMap) {
            return markers
                .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
                .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y);
        } else {
            return markers
                .attr("cx", d => d.xpos)
                .attr("cy", d => y(d.index) - 2 * radius * d.index)
        };

    }

    setInitialPosition(markers
        .enter()
        .append("circle")
        .attr("r", radius)
        .style("fill", d => color(d.value))
        .style("stroke", "white"))
};

function updateScales() {
    let inset;

    if (window.innerWidth > 800) {
        inset = ((window.innerWidth - 800) / 2) + minHorizontalInset;
    } else {
        inset = minHorizontalInset;
    }

    const min = map.containerPointToLayerPoint([
        inset, 
        window.innerHeight * 0.75]);
    const max = map.containerPointToLayerPoint([
        window.innerWidth - inset,
        window.innerHeight * 0.25]);

    x.range([min.x, max.x]);
    y.range([min.y, max.y]);
}

function updateZoom() {
    svg.selectAll("circle")
        .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
        .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y);
}

function update() {
    if (showOnMap) {
        svg.selectAll("circle")
            .transition()
            .duration(2000)
            .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
            .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y);

    } else {
        updateScales();

        const histogram = d3.histogram()
            .domain(ghgDomain)
            .thresholds(x.ticks(nbins))
            .value(d => d["total-ghg"]);

        const bins = histogram(properties);
        const xpos = bins.reduce((acc, bin) => {
            bin.map((property) => {
                acc[property["seed-property-id"]] = calculateMidpoint(bin, x)
            });
            return acc;
        }, {});

        svg.selectAll("circle")
            .transition()
            .duration(2000)
            .attr("cx", d => xpos[d.id])
            .attr("cy", d => y(d.index) - 2 * radius * d.index);
    }
    
}

d3.json("vancouver-properties.json").then(init);
d3.json("vancouver-properties.json").then(init);


const calculateMidpoint = (d, x) => {
    return x(d.x0) + (x(d.x1) - x(d.x0)) / 2
}

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

document.getElementById("show-map")
    .addEventListener("click", () => {
        showOnMap = true;
        enableMap();
        update();
    });

document.getElementById("show-histo")
    .addEventListener("click", () => {
        showOnMap = false;
        disableMap();
        update();
    });

