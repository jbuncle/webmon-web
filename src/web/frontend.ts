import {Chart, ChartOptions, ChartData} from 'chart.js';
import {$} from './util';
import {ChartBuilder} from './chartbuilder';

export interface LogEntry {
    timestamp: number;
    duration: number;
}

export type LogData = {[key: string]: number;};


const extractInfo = (logFileName: string): {domain: string, date: string} => {
    const regex: RegExp = /^(\/logs\/)?(.*)\-([0-9]{4}\-[0-9]{2}\-[0-9]{2})\.log$/;
    const matches: RegExpExecArray | null = regex.exec(logFileName);

    if (matches !== null) {
        return {
            domain: matches[2],
            date: matches[3],
        };
    }
    throw new Error(`Failed to extract date from log file name '${logFileName}'`);
}

$.ready(function () {

    function dataToJson(data: string): LogData {
        var processed: LogData = {};
        var lines: Array<string> = data.split("\n");
        $.each(lines, function (index, line) {
            var line = lines[index];
            if (line.trim()) {
                var json: LogEntry = JSON.parse(line);
                processed[json.timestamp] = json.duration;
            }
        });
        return processed;
    }

    $.get('/list', (data) => {
        var files: Array<string> = JSON.parse(data);

        let logsByDate: {[key: string]: string[]} = {};

        $.each(files, (index: number, logName: string) => {
            const info = extractInfo(logName);
            const logDate: string = info.date;
            if (logsByDate[logDate]) {
                logsByDate[logDate].push('/logs/' + logName);
            } else {
                logsByDate[logDate] = ['/logs/' + logName];
            }
        });

        logsByDate = $.objectSort(logsByDate, (x: string, y: string) => {
            return y.localeCompare(x);
        });

        $.items(logsByDate, (key: string, urls: string[]) => {
            $.getAll(urls, (allData: {[data: string]: string | undefined}) => {
                const chartBuilder = new ChartBuilder(createCanvas());
                $.items(allData, (logName: string, response: string) => {
                    const domain = extractInfo(logName).domain;
                    const jsonData: LogData = dataToJson(response);
                    chartBuilder.addDataset(domain, jsonData);
                });
                chartBuilder.buildChart();
            }, (err) => {
                console.error(err)
            });
        })

    }, (err: ProgressEvent | number) => {
        console.log(err);
    });

    function createCanvas(): HTMLCanvasElement {
        const chartCanvas: HTMLCanvasElement = document.createElement('canvas');
        const container: HTMLElement | null = document.getElementById('container');
        if (container === null) {
            throw new Error("Failed to find #container");
        }
        container.appendChild(chartCanvas);
        return chartCanvas;
    }
});
