export function checkBodyRequest(body:any, fieldsToCheck: string[]): string | null {
    fieldsToCheck.forEach(field => {
        const temp = body[field];
        if(temp === undefined || temp ===null)
            return field;
    });
    return null;
}
