import { Schema } from "mongoose";
import { E_ROLE } from "./user.model";

export interface TokenDataDTO{
    name: string;
    lastname: string;
    email: string;
    roles: E_ROLE;
    id: Schema.Types.ObjectId;
}
