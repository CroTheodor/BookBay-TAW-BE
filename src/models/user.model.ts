import { Schema, SchemaTypes } from "mongoose";

export interface UserDTO {
    readonly id: Schema.Types.ObjectId;
    name: string;
    lastname: string;
    email:string;
    role: E_ROLE;
    salt: string;
    digest: string;
    deliveryInfo: UserDeliveryInfoDTO;
}

export enum E_ROLE{
    USER = "r_user",
    MODERATOR = "r_moderator"
}

export interface UserDeliveryInfoDTO{
    address: string;
    city: string;
    post_code: number;
    county: string;
}

const userSchema = new Schema<UserDTO>({
    name: {
        type: SchemaTypes.String,
        required: true,
    },
    email: {
        type: SchemaTypes.String,
        required: true,
        unique: true
    },
    role: {
        type: SchemaTypes.String,
        required: true,
    },
    salt: {
        type: SchemaTypes.String,
        required: false
    },
    digest: {
        type: SchemaTypes.String,
        required: true
    }
})

userSchema.methods.setPassword = function( pwd: string) {
}
