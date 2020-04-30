import {Util} from "./util";


export type ApiLogFile = {
    info: ApiLogFileInfo;
    entries: ApiLogEntry[];
};


export interface ApiLogEntry {
    url: string;
    statusCode?: number;
    message: string;
    success: boolean;
    duration: number;
    timestamp: number;
}

export interface ApiLogFileInfo {
    path: string;
    domain: string;
    date: string;
}

export class Api {


    private dataToJson(data: string): ApiLogEntry[] {
        var processed: ApiLogEntry[] = [];
        var lines: Array<string> = data.split("\n");
        Util.each(lines, (index: number, line: string) => {
            if (line.trim()) {
                const json: ApiLogEntry = JSON.parse(line);
                processed.push(json);
            }
        });
        return processed;
    }

    /**
     * Fetch log files for given URLS
     */
    public logs(
        urls: string[]
    ): Promise<ApiLogFile[]> {

        const promises: Promise<ApiLogFile>[] = [];

        Util.each(urls, (index: number, url: string) => {
            const info: ApiLogFileInfo = this.extractInfo(url);
            promises.push(this.log(info))
        });

        return Promise.all(promises);
    }

    public log(log: ApiLogFileInfo): Promise<ApiLogFile> {
        const url: string = '/logs/' + log.path;
        return this.mapPromise(Util.promiseGet(url), (value: string): ApiLogFile => {
            console.log(`Fetched ${url}:`);
            return {
                info: log,
                entries: this.dataToJson(value),
            };
        })
    }

    private mapPromise<In, Out>(promise: Promise<In>, map: (value: In) => Out): Promise<Out> {
        return new Promise((resolutionFunc, rejectionFunc) => {
            promise.then((value: In) => {
                resolutionFunc(map(value));
            }).catch(rejectionFunc)
        });
    }
    public list(): Promise<{[key: string]: ApiLogFileInfo[]}> {
        return this.mapPromise(Util.promiseGet('/list'), (data: string) => {
            console.log('Fetched /list: ', data);
            var files: Array<string> = JSON.parse(data);

            let logsByDate: {[key: string]: ApiLogFileInfo[]} = {};

            Util.each(files, (index: number, logName: string) => {
                const info = this.extractInfo(logName);

                const logDate: string = info.date;
                if (logsByDate[logDate]) {
                    logsByDate[logDate].push(info);
                } else {
                    logsByDate[logDate] = [info];
                }
            });

            return Util.objectSort(logsByDate, (x: string, y: string) => {
                return y.localeCompare(x);
            });

        });
    }


    private extractInfo(logFileName: string): ApiLogFileInfo {
        const regex: RegExp = /^(\/logs\/)?(.*)\-([0-9]{4}\-[0-9]{2}\-[0-9]{2})\.log$/;
        const matches: RegExpExecArray | null = regex.exec(logFileName);

        if (matches !== null) {
            return {
                path: logFileName,
                domain: matches[2],
                date: matches[3],
            };
        }
        throw new Error(`Failed to extract date from log file name 'Util{logFileName}'`);
    }

}