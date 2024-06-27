import { Schema, SchemaTypes } from "mongoose";

export interface BookDTO{
    title:string;
    author: string;
    cover_img?: string;
    publisher?: string;
    course?: string;
}

export const bookSchema = new Schema({
    title: { type : SchemaTypes.String, required: true },
    author: { type : SchemaTypes.String, required: true },
    cover_img: { type : SchemaTypes.String, required: false },
    publisher: { type : SchemaTypes.String, required: false },
    course: { type: SchemaTypes.String, required: false }
})
