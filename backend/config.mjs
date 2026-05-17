import dotenv from 'dotenv';
dotenv.config();
export const config = {
port: process.env.PORT,
mongoDB:process.env.mongoDB, 
secretKey:process.env.accesekey,
secretAccesekey:process.env.secretAccesekey,
region:process.env.region,
secretMessage:process.env.secretMessage
};
