import express from 'express';
import logger from 'morgan';

import drawRouter from './routes/draw';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/draw', drawRouter);

export default app;
