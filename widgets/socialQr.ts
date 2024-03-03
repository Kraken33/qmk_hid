import { asyncPipe } from '../modules/fp';
import { widget } from '../modules/widget';
import { render } from '../modules/renderUtils';

export const socialQrWidget = render(
    async () => {
        return asyncPipe(
            widget.create,
            widget.combine(
                await widget.createImage('qr.png'), 5, 0
            )
        )({ width: 32, height: 25 });;
    },
    { x: 8, y: 0, screenIndex: 1 }
)();