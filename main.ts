import dayjs from 'dayjs';
import dotenv from 'dotenv';
import { widget } from './modules/widget';
import fp from './modules/fp';
// @ts-ignore: Unreachable code error
import { keyboard } from './modules/keyboard';
import { repeatEvery } from './modules/timer';
import { oled } from './modules/oled';

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
    1000: 'clear',
    1183: 'lr'
};

async function main() {
    const fetchWeather = async () => {
        return await ((await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${process.env.WEATHER_API_LOCATION}&aqi=no`)).json()) as WeatherAPIResponse;
    }

    let frameId = 0;
    repeatEvery(100)(fp.asyncPipe(
        async () => {
            frameId = frameId === 8 ? 0 : frameId;
            return await fp.asyncPipe(
                widget.create,
                widget.combine(
                    await widget.createImage(`./anim/${++frameId}.png`), 0, 0
                )
            )({ width: 32, height: 32 });;
        },
        widget.convert2Bytes,
        oled.render({ x: 12, y: 0, screenIndex: 2 })
    ))

    repeatEvery(60_000)(
        fp.asyncPipe(
            async () => {
                const time = dayjs(Date.now()).format('HH:mm');
                const timeWidget = fp.asyncPipe(
                    widget.create,
                    widget.addText(time, { size: 17 }),
                )({ width: 32, height: 22 });

                return await timeWidget;
            },
            widget.convert2Bytes,
            oled.render({ x: 14, y: 0 })
        )
    )

    fp.asyncPipe(
        async () => {
            return await fp.asyncPipe(
                widget.create,
                widget.combine(
                    await widget.createImage('qr.png'), 5, 0
                )
            )({ width: 32, height: 25 });;
        },
        widget.convert2Bytes,
        oled.render({ x: 8, y: 0 })
    )();

    repeatEvery(10 * 60_000)(
        fp.asyncPipe(
            async () => {
                const weather = await fetchWeather();

                const { isDay, temperature, iconCode } = {
                    isDay: weather.current.is_day,
                    temperature: weather.current.temp_c,
                    iconCode: weather.current.condition.code,
                }

                const tempWidget = await fp.asyncPipe(
                    widget.create,
                    widget.addText(`${temperature} C`, { size: 17 }),
                )({ width: 32, height: 20 });

                const weatherConditionIcon = await widget.createImage(weatherIcons[iconCode] ? `${weatherIcons[iconCode]}_${isDay ? 'day' : 'night'}.png` : 'light_snow.png');

                return await fp.asyncPipe(
                    widget.create,
                    widget.combine(weatherConditionIcon, 0, 0),
                    widget.combine(tempWidget, 2, 36),
                )({ width: 32, height: 60 })
            },
            widget.convert2Bytes,
            oled.render({ x: 0, y: 0 })
        )
    )

};

keyboard.waitForDevice(main);

