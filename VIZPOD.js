var n = 50; // number of points
var max = 100; // maximum of x and y

// dimensions and margins
var svgContainer = d3.select("#graph"),

svg = svgContainer.append('svg').attr("width", 1000).attr("height", 1000)
    width = +svg.attr("width"),
    height = +svg.attr("height"),

width = 0.8*width;
height = 0.8*height;
var margin = {top: (0.1*width), right: (0.1*width), bottom: (0.1*width), left: (0.1*width)};


var gSlider = d3
  .select('#graph')
  .append('svg')
  .attr('width', 375)
  .attr('height', 200)
  .append('g')
  .attr('transform', 'translate(30,30)');

// create a clipping region 
svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height)

var palette = ['#1f77b4',
 '#aec7e8',
 '#ff7f0e',
 '#ffbb78',
 '#2ca02c',
 '#98df8a',
 '#d62728',
 '#ff9896',
 '#9467bd',
 '#c5b0d5',
 '#8c564b',
 '#c49c94',
 '#e377c2',
 '#f7b6d2',
 '#7f7f7f',
 '#c7c7c7',
 '#bcbd22',
 '#dbdb8d',
 '#17becf',
 '#9edae5']
  
var current_k = 5
var current_viz = 'tsne'
d3.csv('VIZPOD.csv', function(data){
    //console.log(data)
    // create scale objects
    data = data.slice(0, 5000)
    var xScale = d3.scaleLinear()
        .domain([-max, max])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([-max, max])
        .range([height, 0]);
    // create axis objects
    var xAxis = d3.axisBottom(xScale)
        .ticks(20, "s");
    var yAxis = d3.axisLeft(yScale)
        .ticks(20, "s");
    // Draw Axis
    var gX = svg.append('g')
        .attr("id", 'x')
        .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height) + ')')
        .call(xAxis);
    var gY = svg.append('g')
        .attr("id", 'y')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(yAxis);

    var mouseover = function(d){
        d_k = d['km_'+current_k]
        d3.selectAll("circle[k='" + d_k + "']")
            //.transition()
            //.duration(100)
            .attr('r', 5)
            //.attr("r", 3)
        tooltip.style("opacity", 1)
        d3.select(this).style("stroke", "black")
        //console.log(current_k)
    }
    var mouseleave = function(d){
        //console.log(d.length)
        d_k = d['km_'+current_k]
        d3.selectAll("circle[k='" + d_k + "']")
            //.transition()
            //.duration(100)
            .attr('r', 3)
            //.style("fill", palette[d['km_10']])
            //.attr("r", 5)
        tooltip.style("opacity", 0)
        d3.select(this).style("stroke", "transparent")
    }
     var mousemove = function(d) {
        tooltip
            .html(d.Title)
            .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
    }

    var update_classes = function(k){
        d3.selectAll("circle").each(function(d, i) {
            //console.log(d3.select(this))
            d3.select(this)
                .style("fill", palette[d['km_'+k]])
                .attr("k", k)
        })
    }

    var update_viz = function(d){
        if(d3.select('#PCA_TSNE').property("checked")){
            console.log("PCA")
            current_viz = 'pca'

            xScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, width]);
            yScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([height, 0]);

            xAxis = d3.axisBottom(xScale)
                .ticks(20, "s");
            yAxis = d3.axisLeft(yScale)
                .ticks(20, "s");

            d3.select('#x').call(xAxis)
            d3.select('#y').call(yAxis)

            points.data(data)
                .attr('cx', function(a){ return xScale(a[current_viz + "_x"])})
                .attr('cy', function(a){ return yScale(a[current_viz + "_y"])});

        }
        else{
            current_viz = 'tsne'
            console.log("tsne")
            xScale = d3.scaleLinear()
                .domain([-max, max])
                .range([0, width]);
            yScale = d3.scaleLinear()
                .domain([-max, max])
                .range([height, 0]);

            xAxis = d3.axisBottom(xScale)
                .ticks(20, "s");
            yAxis = d3.axisLeft(yScale)
                .ticks(20, "s");

            d3.select('#x').call(xAxis)
            d3.select('#y').call(yAxis)

            points.data(data)
                .attr('cx', function(a){ return xScale(a[current_viz + "_x"])})
                .attr('cy', function(a){ return yScale(a[current_viz + "_y"])});

        }
    }

    var slider = d3
    .sliderBottom()
    .min(2)
    .max(19)
    .default(5)
    .step(1)
    .width(300)
    .ticks(18)
    .handle(
        d3
        .symbol()
        .type(d3.symbolCircle)
        .size(200)()
    )
    .on('onchange', num => {
        current_k = num
        update_classes(num)
    });
    gSlider
        .append('g')
        .attr('transform', `translate(30,30)`)
        .call(slider);

    d3.select('#PCA_TSNE').on('change', update_viz);

    var tooltip = svgContainer
        .append("div")
        .style("opacity", 1)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", "absolute")

    // Draw Datapoints
    var points_g = svg.append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr("clip-path", "url(#clip)")
        .classed("points_g", true);

    var points = points_g.selectAll("circle").data(data);
    points = points.enter().append("circle")
        .attr('cx', function(d) {return xScale(d.tsne_x)})
        .attr('cy', function(d) {return yScale(d.tsne_y)})
        .attr('r', 3)
        .attr('k', function(d){return d['km_'+current_k]})
        .attr('index', function(d){return d[""]})
        .style('fill', function(d){return palette[d['km_'+current_k]]})
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        
    // Pan and zoom
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    svg.call(zoom)


    function zoomed(e) {
    // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(xScale);
        var new_yScale = d3.event.transform.rescaleY(yScale);
    // update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));
        points.data(data)
        .attr('cx', function(d) {return new_xScale(d[current_viz + "_x"])})
        .attr('cy', function(d) {return new_yScale(d[current_viz + "_y"])});
    }

})