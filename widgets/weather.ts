import { asyncPipe } from '../modules/fp';
import { widget } from '../modules/widget';
import { repeatEvery } from '../modules/timer';
import { render, useState } from '../modules/renderUtils';
import { flowRight } from 'lodash/fp';

type WeatherAPIResponse = {
    current: {
        is_day: boolean;
        temp_c: number;
        condition: {
            code: number;
        }
    },
}

const weatherIcons: any = {
    1003: 'pc',
    1000: 'clear',
    1183: 'lr'
};

export const weatherWidget = flowRight(
    useState((setState) => {
        const fetchWeather = async () => {
            return await ((await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${process.env.WEATHER_API_LOCATION}&aqi=no`)).json()) as WeatherAPIResponse;
        };

        repeatEvery(10 * 60_000)(async () => {
            const weather = await fetchWeather();

            setState({
                isDay: weather.current.is_day,
                temperature: weather.current.temp_c,
                iconCode: weather.current.condition.code,
            });
        })
    }),
    render(async ({ isDay, temperature, iconCode }) => {

        const tempWidget = await asyncPipe(
            widget.create,
            widget.addText(`${temperature} C`, { size: 17 }),
        )({ width: 32, height: 20 });

        const weatherConditionIcon = await widget.createImage(weatherIcons[iconCode] ? `${weatherIcons[iconCode]}_${isDay ? 'day' : 'night'}.png` : 'light_snow.png');

        return await asyncPipe(
            widget.create,
            widget.combine(weatherConditionIcon, 0, 0),
            widget.combine(tempWidget, 2, 36),
        )({ width: 32, height: 60 })
    }, { x: 0, y: 0, screenIndex: 1 })
);