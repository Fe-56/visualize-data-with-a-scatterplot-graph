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
                const doping = rawDataset[i].Doping === "" ? false : true;
                const name = rawDataset[i].Name;
                const nationality = rawDataset[i].Nationality;
                const dopingDescription = rawDataset[i].Doping;
                years.push(year);
                times.push(time);
                dataset.push({
                    year: year,
                    time: time,
                    doping: doping,
                    name: name,
                    nationality: nationality,
                    dopingDescription: dopingDescription
                });
            }

            let timeMin = d3.min(times);
            let timeMax = d3.max(times);
            timeMin = mmssToDate(timeMin);
            timeMax = mmssToDate(timeMax);

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

            d3.select("#holder")
                .append("svg")
                .attr("width", width + 100)
                .attr("height", height)
                .append("g")
                .call(xAxis)
                .attr("id", "x-axis")
                .attr("transform", `translate(60, ${height - 40})`)
                .attr("color", "white");

            d3.select("svg")
                .append("g")
                .call(yAxis)
                .attr("id", "y-axis")
                .attr("transform", `translate(60, -40)`)
                .attr("color", "white");

            const dopingColor = "#FF2975";
            const noDopingColor = "#FFD319";

            d3.select("svg")
                .selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (datapoint) => {
                    return xScale(datapoint.year) + 60;
                })
                .attr("cy", (datapoint) => {
                    return yScale(mmssToDate(datapoint.time)) - 40;
                })
                .attr("r", 8)
                .attr("data-xvalue", (datapoint) => {
                    return datapoint.year;
                })
                .attr("data-yvalue", (datapoint) => {
                    return mmssToDate(datapoint.time);
                })
                .attr("fill", (datapoint) => {
                    if (datapoint.doping){ // with doping allegation
                        return dopingColor;
                    }

                    else{ // no doping allegation
                        return noDopingColor;
                    }
                })
                .on("mouseover", (event, item) => {
                    let tooltipTextColor;
                    let tooltipText =  `${item.name}, ${item.nationality}<br />Year: ${item.year}<br />Time: ${item.time}`;

                    if (item.doping){ // with doping allegation
                        tooltipTextColor = dopingColor;
                        tooltipText += `<br />${item.dopingDescription}`;
                    }

                    else{ // no doping allegation
                        tooltipTextColor = noDopingColor;
                    }

                    d3.select(event.currentTarget).attr("r", 15);
                    const tooltip = document.getElementById("tooltip");
                    tooltip.style.visibility = "visible";
                    tooltip.style.color = tooltipTextColor;
                    tooltip.innerHTML = tooltipText;
                    tooltip.setAttribute("data-year", d3.select(event.currentTarget).attr("data-xvalue"));
                })
                .on("mouseout", (event) => {
                    document.getElementById("tooltip").style.visibility = "hidden";
                    d3.select(event.currentTarget).attr("r", 8);
                });

            const legendX = 1000
            const legendY = 100

            d3.select("svg")
                .append("g")
                .attr("id", "legend")
                .append("circle")
                .attr("cx", legendX)
                .attr("cy", legendY)
                .attr("r", 15)
                .attr("fill", "#FF2975"); // for those with doping allegations

            d3.select("#legend")
                .append("text")
                .attr("class", "legend-label")
                .attr("x", legendX + 30)
                .attr("y", legendY + 5)
                .text("Rider with doping allegation");

            d3.select("#legend")
                .append("circle")
                .attr("cx", legendX)
                .attr("cy", legendY + 40)
                .attr("r", 15)
                .attr("fill", "#FFD319"); // for those without doping allegations

            d3.select("#legend")
            .append("text")
            .attr("class", "legend-label")
            .attr("x", legendX + 30)
            .attr("y", legendY + 45)
            .text("Rider without doping allegation")
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