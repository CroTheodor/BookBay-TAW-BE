import moment from "moment";
import colors from "colors/safe";

export class Logger {

    static log(msg: string) {
        const formatedMessage = `${moment().format("HH:mm:ss")} - ${msg}`
        console.log("============================================================");
        console.log(colors.yellow(formatedMessage));
        console.log("============================================================");
    }

    static error(msg: string) {
        const formatedMessage = `${moment().format("HH:mm:ss")} - ${msg}`
        console.log("============================================================");
        console.log(colors.red(formatedMessage));
        console.log("============================================================");
    }

    static success(msg: string) {
        const formatedMessage = `${moment().format("HH:mm:ss")} - ${msg}`
        console.log("============================================================");
        console.log(colors.green(formatedMessage));
        console.log("============================================================");
    }


    private Logger() {

    }
}
