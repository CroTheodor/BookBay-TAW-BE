import moment from "moment";
import colors from "colors/safe";

export class Logger {

    static log(msg: string) {
        const time = new Date();
        const formatedMessage = `${moment(time).format("HH:mm")} - ${msg}`
        console.log("============================================================");
        console.log(colors.yellow(formatedMessage));
        console.log("============================================================");
    }

    static error(msg: string) {
        const time = new Date();
        const formatedMessage = `${moment(time).format("HH:mm")} - ${msg}`
        console.log("============================================================");
        console.log(colors.red(formatedMessage));
        console.log("============================================================");
    }

    private Logger() {

    }
}
