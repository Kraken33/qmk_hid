import express from 'express';
import logger from 'morgan';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayjs from 'dayjs';

dayjs.extend(isoWeek)

import drawRouter from './routes/draw';
import initRouter from './routes/init';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/draw', drawRouter);
app.use('/init', initRouter);

export default app;
