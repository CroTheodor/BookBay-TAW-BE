import { Model, Schema, SchemaTypes, model, Document } from "mongoose";
import crypto from "crypto";

export interface UserDTO extends Document {
    readonly id: Schema.Types.ObjectId;
    name: string;
    lastname: string;
    email:string;
    role: E_ROLE;
    salt: string;
    digest: string;
    deliveryInfo: UserDeliveryInfoDTO;
    setPassword: (pwd:string) => void,
    validatePassword: (pwd:string)=>boolean;
    hasRole: (role: E_ROLE)=>boolean;
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
    this.salt = crypto.randomBytes(16).toString('hex');
    // hmac stands for Hashed Message Authentication Code
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest('hex');
}

userSchema.methods.validatePassword = function(pwd: string): boolean {
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(pwd);
    const digest = hmac.digest('hex');
    return this.digest === digest;
}

userSchema.methods.hasRole = function(role: E_ROLE): boolean {
    return this.role === role;
}

export function getSchema(){
    return userSchema;
}

let userModel: any;
export function getModel(): Model<UserDTO> {
    if(!userModel) {
        userModel = model('User', getSchema());
    }
    return userModel;
}

export function newUser( data: any): UserDTO {
    let _usermodel = getModel();
    let user = new _usermodel(data);
    return user;
}
