import React, {Component} from 'react';
import axios from "axios";
import {feature} from "topojson-client";
import {geoKavrayskiy7} from "d3-geo-projection";
import {select as d3Select} from 'd3-selection';

import {SAT_API_KEY, SATELLITE_POSITION_URL, WORLD_MAP_URL} from "../constants";
import {geoGraticule, geoPath} from "d3-geo";
import * as d3Scale from "d3-scale";
import {schemeCategory10} from "d3-scale-chromatic";
import {timeFormat} from "d3-time-format";
import {Spin} from "antd";

const width = 960;
const height = 600;

class WorldMap extends Component {

    constructor() {
        super();
        this.state = {
            map: null,
            color: d3Scale.scaleOrdinal(schemeCategory10),
            isLoad: false
        }
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then(res => {
                const {data} = res;
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch(e => console.log('err in fetch world map data', e))
    }

    generateMap = land => {
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);
        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        let context = canvas.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");

        const graticule = geoGraticule();

        let path = geoPath()
            .projection(projection)
            .context(context);

        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })

        this.setState({
            map: {
                projection: projection,
                graticule: graticule,
                context: context,
                context2: context2
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.satData !== prevProps.satData) {
            // fetch satellite position
            // get observer data from setting
            const {
                observerLat,
                observerLong,
                observerElevation,
                duration
            } = this.props.observerData;

            // get duration
            const startTime = duration[0] * 60, endTime = duration[1] * 60;

            // get urls
            const urls = this.props.satData.map(sat => {
                const {satid} = sat;
                const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${startTime}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });

            this.setState(() => ({ isLoad: true }));

            axios.all(urls)
                .then(
                    axios.spread((...args) => {
                        return args.map(item => item.data)
                    })
                )
                .then(
                    res => {
                        console.log('res -> ', res);
                        this.track(res);
                        this.setState(() => ({ isLoad: false }));
                    }
                )
        }
    }

    track(data) {
        console.log('2 -> ', data);
        const { duration } = this.props.observerData;
        const len = data[0].positions.length;
        const { context2 } = this.state.map;
        let now = new Date();

        let i = 0;
        let timer = setInterval(() => {
            let timePassed = Date.now() - now;

            if (i === 0) {
                now.setSeconds(now.getSeconds() + duration[0] * 60);
            }

            let time = new Date(now.getTime() + 60 * timePassed);
            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(timeFormat(time), width / 2, 10);


            if (i >= len) {
                clearInterval(timer);
                return;
            }

            data.forEach(sat => {
                const {info, positions} = sat;
                console.log('1111 -> ', info, positions);
                this.drawSat(info, positions[i]);
            })

            i += 60;
        }, 1000)
    }

    drawSat(sat, pos){
        const name = (sat.satname).split('-').length == 1 ? (sat.satname).split(' ')[1] : (sat.satname).split('-')[1];
        const { projection, context2 } = this.state.map;
        const xy = projection([pos.satlongitude, pos.satlatitude]);

        context2.fillStyle = this.state.color(name);
        context2.beginPath();
        context2.arc(xy[0],xy[1],4,0,2*Math.PI);
        context2.fill();

        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(name, xy[0], xy[1]+14);
    }

    render() {
        const { isLoad } = this.state;
        return (
            <div className="map-box">
                {
                    isLoad ?
                        <div className="spinner">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        null
                }
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
            </div>
        );
    }
}

export default WorldMap;