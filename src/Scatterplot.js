import React, { useEffect } from 'react';
import * as d3 from 'd3';

const Scatterplot = (props) => {
    const height = 650;
    const width = 1200;
    const dataset = [];
    const years = [];
    const times = [];

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
        .then(res => res.json())
        .then((result) => {
            const rawDataset = result;

            for (let i = 0; i < rawDataset.length; i++){
                const year = rawDataset[i].Year;
                const time = rawDataset[i].Time;
                years.push(year);
                times.push(time);
                dataset.push([year, time]);
            }

            let timeMin = d3.min(times);
            let timeMax = d3.max(times);
            timeMin = mmssToDate(timeMin);
            timeMax = mmssToDate(timeMax);

            console.log(dataset)

            const xScale = d3.scaleLinear()
                            .domain([d3.min(years) - 1, d3.max(years) + 1])
                            .range([0, width]);
            const xAxis = d3.axisBottom(xScale)
                            .tickFormat(d3.format("d"));
            const yScale = d3.scaleTime()
                            .domain([timeMax, new Date(timeMin.getTime() - (0.5 * 60000))])
                            .range([height, 0]);
            const yAxis = d3.axisLeft(yScale)
                            .tickFormat(d3.timeFormat("%M:%S"))
                            .ticks(d3.timeSecond.every(15));

            var svg = d3.select("#holder")
                        .append("svg")
                        .attr("width", width + 100)
                        .attr("height", height)
                        .append("g")
                        .call(xAxis)
                        .attr("id", "x-axis")
                        .attr("transform", `translate(60, ${height - 40})`)
                        .append("g")
                        .call(yAxis)
                        .attr("id", "y-axis")
                        .attr("transform", `translate(0, ${-height })`);

            svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (datapoint) => {
                    return xScale(datapoint[0]);
                })
                .attr("cy", (datapoint) => {
                    return yScale(mmssToDate(datapoint[1]));
                })
                .attr("r", 8)
                .attr("data-xvalue", (datapoint) => {
                    return datapoint[0];
                })
                .attr("data-yvalue", (datapoint) => {
                    return mmssToDate(datapoint[1]);
                })
                .attr("fill", "black")
        });
    }, []);

    return (
        <div id="holder"></div>
    )
}

function mmssToDate(mmss){
    let temp = mmss.split(":");
    let date = new Date();
    date.setHours(0);
    date.setMinutes(temp[0]);
    date.setSeconds(temp[1]);
    return date;
}

export default Scatterplot;