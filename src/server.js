import { config } from 'dotenv';
config();

import express from 'express';
import mongoose from 'mongoose';
import helmet from "helmet";
import morgan from 'morgan';
import { Server } from "http";

// Models
import './models/Product.js';
import './models/ProductStore.js';
import './models/Store.js';

// Jobs
import { startScrapingJob } from './jobs/cronJobs.js';

const app = express();
const server = new Server(app);

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DB_CONNECTION_STRING);

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

startScrapingJob();

import routes from './routes.js';
app.use('/api', routes);

server.listen(process.env.PORT || 5000);