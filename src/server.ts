import express from "express";
import { Logger } from "./utility/logger";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
const io = require('socket.io');

require("dotenv").config();
export let ios = undefined;

const PORT = process.env.PORT || 3500;
const app = express()

app.use((req: { url: any; method: any; }, res: any, next: () => void) => {
    Logger.log(`New request for: ${req.url}\nMethod: ${req.method}`);
    next();
})

app.use(express.json({limit: '50mb'}));
app.use(cors())

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user.route'));
app.use('/listings', require('./routes/listings.route'));

mongoose.connect(process.env.db_url as string).then(
    () => {
        let server = http.createServer(app);
        ios = io(server, {
            cors: {
                origin:"http://localhost:4200",
                methods:["GET", "POST"]
            }
        });
        ios.on("connection", (socket) => {
            socket.emit("message", "HELLO WORLD");
        })
        // io.engine.on("connection_error", (err) => {
        //     console.log(err.req);      // the request object
        //     console.log(err.code);     // the error code, for example 1
        //     console.log(err.message);  // the error message, for example "Session ID unknown"
        //     console.log(err.context);  // some additional error context
        // });
        server.listen(PORT, () => Logger.log(`Server running on port ${PORT}`));
    }
).catch(
    (err) => {
        Logger.error(`Error occured during initialization.\n${err}`)
    }
)
