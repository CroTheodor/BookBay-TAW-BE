import express from "express";
import { Logger } from "./utility/logger";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";

require("dotenv").config();

const PORT = process.env.PORT || 3500;
const app = express()

app.use((req: { url: any; method: any; }, res: any, next: () => void) => {
    Logger.log(`New request for: ${req.url}\nMethod: ${req.method}`);
    next();
})

app.use(express.json());
app.use(cors())

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user.route'));
app.use('/listings', require('./routes/listings.route'));

mongoose.connect(process.env.db_url as string).then(
    () => {
        let server = http.createServer(app);
        app.listen(PORT, () => Logger.log(`Server running on port ${PORT}`));
    }
).catch(
    (err) => {
        Logger.error(`Error occured during initialization.\n${err}`)
    }
)
