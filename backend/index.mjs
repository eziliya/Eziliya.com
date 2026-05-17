import express from 'express';
import mongoose from 'mongoose';
import router from './src/router.mjs';
import { config } from './config.mjs';
import multer from "multer"
import cors from 'cors'
const app = express()
app.use(multer().any());
app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
mongoose.connect(config.mongoDB).then(() => {
console.log('MongoDB connected')
}).catch(err=>{
 console.error('MongoDB connection error:',err)   
})
app.use('/', router);
app.listen(config.port,()=>{
    console.log(`server is running on port ${config.port}`)
})
