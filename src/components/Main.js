import React, {Component} from 'react';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from "../constants";
import axios from "axios";
import WorldMap from "./WorldMap";

class Main extends Component {

    constructor() {
        super();
        this.state = {
            satInfo: null,
            setting: null,
            isLoadingList: false,
        }
    }

    showNearbySatellite = (setting) => {
        this.setState({
            setting: setting
        })
        this.fetchSatellite(setting);
    }

    fetchSatellite = (setting) => {
        const {
            observerLat,
            observerLong,
            observerElevation,
            satAlt,
            duration
        } = setting;

        const url = `${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerElevation}/${satAlt}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        this.setState({
            isLoadingList: true
        });

        axios.get(url)
            .then(response => {
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false,
                })
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
            })
    }

    showMap = (satList) => {
        console.log(satList);
    }

    render() {
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList satInfo={this.state.satInfo}
                                   isLoading={this.state.isLoadingList}
                                   onShowMap={this.showMap}
                    ></SatelliteList>
                </div>
                <div className="right-side">
                    <WorldMap></WorldMap>
                </div>
            </div>
        );
    }
}

export default Main;