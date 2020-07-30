import React, {Component} from 'react';
import {Button, InputNumber, Slider} from 'antd';

class SatSetting extends Component {

    constructor(props){
        super(props);
        this.state = {
            observerLat: 0,
            observerLong: 0,
            observerElevation: 0,
            satAlt: 90,
            duration: [0, 90],
            isLoading: false
        }
    }

    render() {
        const durationMarkers = {
            0: "0",
            90: "90",
        }

        return (
            <div className="sat-setting">
                <div className="loc-setting">
                    <p className="setting-label">From Location</p>
                    <div className="setting-list two-item-col">
                        <div className="list-item">
                            <label>Longitude: </label>
                            <InputNumber min={-180}
                                         max={180}
                                         defaultValue={0}
                                         style={{margin: "0 2px"}}
                                         onChange={this.onChangeLon}>
                            </InputNumber>
                        </div>
                        <div className="list-item right-item">
                            <label>Latitude: </label>
                            <InputNumber min={-90}
                                         max={90}
                                         defaultValue={0}
                                         style={{margin: "0 2px"}}
                                         onChange={this.onChangeLat}>
                            </InputNumber>
                        </div>
                    </div>
                    <div className="setting-list">
                        <div className="list-item">
                            <label>Elevation(meters)</label>
                            <InputNumber min={-413} max={8850} defaultValue={0} style={{margin: "0 2px"}}
                                         onChange={this.onChangeEle}/>
                        </div>
                    </div>
                </div>
                <div className="altitude-setting">
                    <p className="setting-label">
                        Restrictions
                    </p>
                    <div>
                        <span>Show only satellites which are higher than <br/>altitude</span>
                        <InputNumber min={0} max={90} defaultValue={90} style={{margin: "8px 2px 0"}}
                                     onChange={this.onChangeAlt}></InputNumber>
                    </div>
                </div>
                <div className="duration-setting">
                    <p className="setting-label">
                        Duration(sec)
                    </p>
                    <Slider className="duration-slider"
                            range step={1}
                            defaultValue={[0, 90]}
                            min={0}
                            max={90}
                            marks={durationMarkers}
                            onChange={this.onDurationChange}
                    >
                    </Slider>
                </div>
                <div className="show-nearby">
                    <Button className="show-nearby-btn"
                            onClick={this.showSatellite}
                    >Find Nearby Satellites
                    </Button>
                </div>
            </div>
        );
    }

    onChangeLat(value) {
        this.setState({
            observeLat: value
        })
    }

    onChangeLon(value) {
        this.setState({
            observeLon: value
        })
    }

    onChangeEle(value) {
        this.setState({
            observeElevation: value
        })
    }

    onChangeAlt(value) {
        this.setState({
            satAlt: 90 - +value
        })
    }

    onDurationChange(value) {
        this.setState({
            duration: value
        })
    }

    showSatellite = () => {
        this.props.onShow(this.state)
    }
}

export default SatSetting;