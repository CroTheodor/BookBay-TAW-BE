import { Model, Schema, SchemaTypes, model, Document } from "mongoose";
import crypto from "crypto";

export interface UserDTO extends Document {
    readonly id: Schema.Types.ObjectId;
    name: string;
    lastname: string;
    email: string;
    roles: E_ROLE[];
    salt: string;
    digest: string;
    shipmentInfo: ShipmentInfoDTO;
    setPassword: (pwd: string) => void,
    validatePassword: (pwd: string) => boolean;
    hasRole: (role: E_ROLE) => boolean;
    passwordChanged: boolean;
}

export enum E_ROLE {
    STUDENT = "r_student",
    USER = "r_user",
    MODERATOR = "r_moderator"
}

export interface ShipmentInfoDTO {
    address: string;
    city: string;
    post_code: string;
    county: string;
}

const shipmentInfo = new Schema<ShipmentInfoDTO>({
    address: {
        type: SchemaTypes.String,
        required: true
    },
    city: {
        type: SchemaTypes.String,
        required: true
    },
    post_code: {
        type: SchemaTypes.String,
        required: true
    },
    county: {
        type: SchemaTypes.String,
        required: true
    }
})

const userSchema = new Schema<UserDTO>({
    name: {
        type: SchemaTypes.String,
        required: true,
    },
    lastname: {
        type: SchemaTypes.String,
        required: true,
    },
    email: {
        type: SchemaTypes.String,
        required: true,
        unique: true
    },
    roles: {
        type: SchemaTypes.Mixed,
        required: true,
    },
    shipmentInfo: {
        type: shipmentInfo,
        required: false
    },
    salt: {
        type: SchemaTypes.String,
        required: false
    },
    digest: {
        type: SchemaTypes.String,
        required: true
    },
    passwordChanged: {
        type: SchemaTypes.Boolean,
        required: false
    }
})

userSchema.methods.setPassword = function(pwd: string) {
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
    return this.roles.inclue(role);
}

export function getSchema() {
    return userSchema;
}

let userModel: any;
export function getModel(): Model<UserDTO> {
    if (!userModel) {
        userModel = model('User', getSchema());
    }
    return userModel;
}

export function newUser(data: any): UserDTO {
    let _usermodel = getModel();
    let user = new _usermodel(data);
    return user;
}
