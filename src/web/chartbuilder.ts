import {Chart, ChartOptions, ChartData, ChartDataSets} from "chart.js";
import {$} from './util';
import {LogData} from "./frontend";


export interface LogDataSet {
    name: string,
    data: LogData
}

export class ChartBuilder {
    private readonly datasets: Array<LogDataSet>;

    public constructor(
        private readonly chartCanvas: HTMLCanvasElement
    ) {
        this.datasets = [];
    }

    public addDataset(log: string, jsonData: LogData): void {
        this.datasets.push({
            name: log,
            data: jsonData,
        })
    }

    public buildChart(): Chart {
        const data: ChartData = this.getChartData();
        const options: ChartOptions = this.getOptions();

        return new Chart(this.chartCanvas, {
            type: 'line',
            data: data,
            options: options
        });
    }

    private getLabels(): Array<string> {
        // Get all possible labels
        let labels: Array<string> = new Array();
        $.each(this.datasets, (index: number, item: LogDataSet) => {

            // Iterate the dataset
            $.items(item.data, (key: string, value: number) => {
                if (labels.indexOf(key) < 0) {
                    labels.push(key);
                }
            });
        });

        labels = $.arrayUnique(labels);
        labels.sort();
        return labels;
    }

    private toValues(labels: Array<string>, data: LogData): Array<number | undefined> {

        const values: Array<number | undefined> = [];
        $.each(labels, (index: number, key: string) => {
            if (data[key]) {
                const value: number = data[key];
                const cappedValue: number = this.capValue(value, 600);
                values.push(cappedValue);
            } else {
                values.push(undefined);
            }
        });
        return values;
    }

    private getDataSets(labels: Array<string>): ChartDataSets[] {
        const dataset: ChartDataSets[] = [];

        $.each(this.datasets, (index: number, logDataSet: LogDataSet) => {
            const color: string = this.getColorForString(logDataSet.name);
            dataset.push({
                label: logDataSet.name,
                data: this.toValues(labels, logDataSet.data),
                fill: false,
                borderColor: color,
                //                backgroundColor: color

            });
        });

        return dataset;
    }

    private getChartData(): ChartData {

        const labels: Array<string> = this.getLabels();
        return {
            labels: this.formatLabels(labels),
            datasets: this.getDataSets(labels),
        };
    }

    private formatLabels(labels: string[]): string[] {
        return labels.map((value: string) => {
            return this.formatLabel(value);
        })

    }
    public getOptions(): ChartOptions {
        return {
            responsive: true,
            spanGaps: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };
    }

    private capValue(value: number, cap: number): number {
        if (value > cap) {
            return cap;
        }

        return value;
    }

    private formatLabel(timestamp: string): string {
        const timestampNum: number = parseInt(timestamp);
        const roundedDate: Date = this.getRoundedDate(timestampNum, 5);
        var label: string = roundedDate.toISOString();

        return label.substring(0, 16).replace('T', ' ');
    }
    private getRoundedDate(timestamp: number, round: number): Date {
        var date = new Date(timestamp);
        date.setMilliseconds(0);
        date.setSeconds(0);
        var minutes = date.getMinutes();
        var roundedMinutes = round * Math.round(minutes / round);

        date.setMinutes(roundedMinutes);

        return date;
    }
    private getColorForString(str: string): string {
        return this.stringToColour(str);
    }

    private stringToColour(str: string): string {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }
}
