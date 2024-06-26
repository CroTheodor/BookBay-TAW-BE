import { Schema, SchemaTypes } from "mongoose";

export interface BookDTO{
    title:string;
    author: string;
    cover_img: string;
    isbn?:string;
    publisher?: string;
}

export const bookSchema = new Schema({
    title: { type : SchemaTypes.String},
    author: { type : SchemaTypes.String},
    cover_img: { type : SchemaTypes.String},
    isbn: { type : SchemaTypes.String},
    publisher: { type : SchemaTypes.String},
})

bookSchema.path('title').validate(function(){
    if(!(this.title && this.author) && this.isbn){
        throw new Error('Schema.Types.')
    }
    return true;
},'Either title and author or ISBN must be provided')

bookSchema.path('author').validate(function(){
    if(!(this.title && this.author) && this.isbn){
        throw new Error('Schema.Types.')
    }
    return true;
},'Either title and author or ISBN must be provided')

bookSchema.path('cover_img').validate(function(){
    if(!(this.title && this.author) && this.isbn){
        throw new Error('Schema.Types.')
    }
    return true;
},'Either title and author or ISBN must be provided')



bookSchema.path('publisher').validate(function(){
    if(!(this.title && this.author) && this.isbn){
        throw new Error('Schema.Types.')
    }
    return true;
},'Either title and author or ISBN must be provided')

bookSchema.path('isbn').validate(function(){
    if(!(this.title && this.author) && this.isbn){
        throw new Error('Schema.Types.')
    }
    return true;
},'Either title and author or ISBN must be provided')
