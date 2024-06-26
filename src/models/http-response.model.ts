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
