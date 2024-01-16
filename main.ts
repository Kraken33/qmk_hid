import dayjs from 'dayjs';
import dotenv from 'dotenv';
import widget from './modules/widget';
import fp from './modules/fp';
import screen from './modules/screen';
// @ts-ignore: Unreachable code error
import { keyboard } from './modules/keyboard';
import { intervals } from './modules/timer';

dotenv.config();

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
    1000: 'clear'
};

async function main() {
    const fetchWeather = async () => {
        return await ((await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${process.env.WEATHER_API_LOCATION}&aqi=no`)).json()) as WeatherAPIResponse;
    }

    screen.create([
        {
            x: 0,
            y: 0,
            initialState: {
                time: dayjs(Date.now()).format('HH:mm')
            },
            effect(state, update) {
                intervals.set(() => {
                    update({
                        time: dayjs(Date.now()).format('HH:mm')
                    });

                }, 60_000);
            }, async render(state) {
                return await fp.asyncPipe(
                    widget.create,
                    widget.addText(state.time, 12),
                )({ width: 32, height: 20});
            }
        },
        {
            x: 3,
            y: 0,
            initialState: {
                temperature: -1,
                iconCode: 1003,
                isDay: false,
            },
            async effect(state, update) {
                const updateWeather = ()=>fetchWeather().then((weather)=>{
                    console.log(weather);
                    update({
                        isDay: weather.current.is_day,
                        temperature: weather.current.temp_c,
                        iconCode: weather.current.condition.code,
                    });
                });

                await updateWeather();

                intervals.set(async () => {
                    updateWeather();
                }, 30 * 60_000);
            }, async render(state) {
                const tempWidget = await fp.asyncPipe(
                    widget.create,
                    widget.addText(`${state.temperature} C`, 16),
                )({ width: 32, height: 17 });

                const weatherConditionIcon = await widget.createImage('light_snow.png');//`${weatherIcons[state.iconCode]}_${state.isDay ? 'day' : 'night'}.png`);

                return await fp.asyncPipe(
                    widget.create,
                    widget.combine(weatherConditionIcon, 0, 0),
                    widget.combine(tempWidget, 2, 36),
                )({width: 32, height: 60})
            }
        },
    ]);
};

keyboard.waitForDevice().then(main).catch(()=>console.log('err'));

