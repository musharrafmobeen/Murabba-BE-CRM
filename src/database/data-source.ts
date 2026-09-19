import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeormOptions } from './typeorm.options.js';

export default new DataSource(typeormOptions());
