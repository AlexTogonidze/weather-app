import React, { Component } from "react"
import './style.scss';
import axios from 'axios';
import { cityData } from './cityData';
import Autosuggest from 'react-autosuggest';
import { WEATHER_API_URL, UNIT_TYPE, API_KEY } from './config';
import SpinnerComponent from './SpinnerComponent';


const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : cityData.filter(data =>
        data.city.toLowerCase().slice(0, inputLength) === inputValue
    );
};

const getSuggestionValue = suggestion => suggestion.city;

const renderSuggestion = suggestion => (
    <div>
        {suggestion.city}
    </div>
);

class MainComponent extends Component {
    constructor() {
        super();

        this.state = {
            value: '',
            loading: false,
            noResults: false,
            renderContent: false,
            suggestions: [],
            weatherDesc: '',
            currentTemp: '',
            weatherPic: ''
        };


        this.getWeather = this.getWeather.bind(this);
    }


    componentDidMount() {
        document.addEventListener('keypress', this.getResultsByEnterPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.getResultsByEnterPress);
    }

    getResultsByEnterPress = target => {
        if (target.charCode === 13 && this.state.value) {
            this.getWeather();
        }
    };


    fromKelvinToCelsius = (value) => {
        return Math.round(value - 273.15);
    }


    getWeather = () => {

        this.setState({ loading: true, renderContent: true });

        let url = `${WEATHER_API_URL}weather?q=${this.state.value}&?units=${UNIT_TYPE}&APPID=${API_KEY}`;

        axios.get(url)
            .then(response => {
                    this.setState({
                        noResults: false,
                        weatherDesc: response.data.weather[0].description,
                        currentTemp: this.fromKelvinToCelsius(response.data.main.temp) + 'C',
                        weatherPic: response.data.weather[0].icon,
                        loading: false
                    });
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    noResults: true,
                    loading: false
                });
            })
           }


    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: getSuggestions(value)
        });
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });

    };

    selectSuggestion = (e) => {
        this.setState({ value: e.target.innerText },
            () => {
                this.getWeather(e);
            })
    }


    render() {
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: 'Type a city',
            value,
            onChange: this.onChange
        };

        return (
            <div className='container'>
                <h4>Find Current Weather in your city</h4>
                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    onSuggestionSelected={this.selectSuggestion}
                    inputProps={inputProps}
                />

                {this.state.renderContent &&
                    <div>
                        {this.state.loading ? <SpinnerComponent /> :
                            <div>
                                {this.state.noResults ? <p className='noResultsText'>No results were found for "{this.state.value}"</p> :
                                    <div>
                                        <h4 className='weatherHeader'>Weather in {this.state.value}:</h4>
                                        <div className='resultContainer'>
                                            <img src={`http://openweathermap.org/img/wn/${this.state.weatherPic}.png`} alt='weather icon'/>
                                            <p>{this.state.weatherDesc}, {this.state.currentTemp}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }


            </div>

        );
    }
}

export default MainComponent;