import dotenv from 'dotenv';
dotenv.config();
import {Pool , PoolConfig } from 'pg';

const pool_config : PoolConfig = {  
  user: process.env.DB_USER || '', 
  host: process.env.DB_HOST || '',
  password: process.env.DB_PASSWORD || 'admin@123',
  database: process.env.DB_DATABASE || 'NULL',
  port: 6543,
  idleTimeoutMillis: 20000,
  max: 12
};

export const pool = new Pool(pool_config);

