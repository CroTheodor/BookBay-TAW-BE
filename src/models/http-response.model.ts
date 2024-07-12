export class HttpResponse<T>{
    public success:boolean;
    public message:string;
    public response: T

    constructor(success: boolean, message: string, response: T){
        this.success = success;
        this.message = message;
        this.response = response;
    }
}

export class PaginatedList{
    page: number;
    limit: number;
    totalItems: number;
    content: any[];

    constructor(page: number, limit: number, numberOfDocs: number, content?: any[]){
        this.page = page;
        this.limit = limit;
        this.totalItems = numberOfDocs;
        if(content){
            this.content = content;
        }
    }
}
