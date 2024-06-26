import express from "express";
import { Logger } from "./utility/logger";
import cors from "cors";

require("dotenv").config();

const PORT = process.env.PORT || 3500;
const app = express()

app.use((req: { url: any; method: any; },res: any,next: () => void)=>{
    Logger.log(`New request for: ${req.url}\nMethod: ${req.method}`);
    next();
})

app.use(express.json());
app.use(cors())

app.use('/auth', require('./routes/auth'));

app.listen(PORT, ()=>Logger.log(`Server running on poort: ${PORT}`));
