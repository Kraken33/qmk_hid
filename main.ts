import dayjs from 'dayjs';
import dotenv from 'dotenv';
import widget from './modules/widget';
import fp from './modules/fp';
import screen from './modules/screen';

dotenv.config();

(async function main() {
    const fetchWeather = async () => {
        return await ((await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${process.env.WEATHER_API_LOCATION}&aqi=no`)).json());
    }

    screen.create([
        {
            x: 0,
            y: 0,
            state: {
                time: dayjs(Date.now()).format('HH:mm')
            },
            effect(state) {
                setInterval(() => {
                    state.time = dayjs(Date.now()).format('HH:mm');
                }, 60_000);
            }, async render(state) {
                return await fp.asyncPipe(
                    widget.create,
                    widget.addText(state.time, 14),
                )({ width: 32, height: 20 });
            }
        },
        {
            x: 6,
            y: 0,
            state: {
                temperature: '10`C'
            },
            effect(state) {
                setTimeout(async () => {
                    const weather: any = await fetchWeather();
                    state.temperature = weather.current.temp_c;
                    console.log(weather);
                }, 15_000);
            }, async render(state) {
                return await fp.asyncPipe(
                    widget.create,
                    widget.addText(` ${state.temperature}\`C`, 14)
                )({ width: 32, height: 20 });
            }
        },
        {
            x: 2,
            y: 0,
            state: {},
            effect() { },
            async render() {
                return await widget.createImage('oc_moon.png');
            }
        }
    ]);
})();