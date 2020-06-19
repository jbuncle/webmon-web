import {Chart, ChartOptions, ChartData, ChartDataSets} from "chart.js";
import {Util} from './util';

export type ChartSeries = {[key: string]: number;};

export interface ChartDataSet {
    name: string,
    data: ChartSeries
}

export class ChartBuilder {
    private readonly datasets: Array<ChartDataSet>;
    private chart: Chart | undefined;

    public constructor(
        private readonly chartCanvas: HTMLCanvasElement,
        private cap: number = 1500
    ) {
        this.datasets = [];
    }

    public setCap(cap: number): void {
        this.cap = cap;
    }

    public clear():void {
        while(this.datasets.length) {
            this.datasets.pop();
        }
    }
    
    public addDataset(log: string, jsonData: ChartSeries): void {
        this.datasets.push({
            name: log,
            data: jsonData,
        })
    }

    public update(): void {
        if (this.chart !== undefined) {
            this.chart.data = this.getChartData();
            this.chart.options = this.getOptions();
            this.chart.update();
        }
    }

    public updateData(): void {
        if (this.chart !== undefined) {
            this.chart.data = this.getChartData();
            this.chart.update();
        }
    }

    public updateOptions(): void {
        if (this.chart !== undefined) {
            this.chart.options = this.getOptions();
            this.chart.update();
        }
    }

    public buildChart(): Chart {
        const data: ChartData = this.getChartData();
        const options: ChartOptions = this.getOptions();

        this.chart = new Chart(this.chartCanvas, {
            type: 'line',
            data: data,
            options: options
        });

        return this.chart;
    }

    private getLabels(): Array<string> {
        // Get all possible labels
        let labels: Array<string> = new Array();
        Util.each(this.datasets, (index: number, item: ChartDataSet) => {

            // Iterate the dataset
            Util.items(item.data, (key: string, value: number) => {
                if (labels.indexOf(key) < 0) {
                    labels.push(key);
                }
            });
        });

        labels = Util.arrayUnique(labels);
        labels.sort();
        return labels;
    }

    private toValues(labels: Array<string>, data: ChartSeries): Array<number | undefined> {

        const values: Array<number | undefined> = [];
        Util.each(labels, (index: number, key: string) => {
            if (data[key]) {
                const value: number = data[key];
                const cappedValue: number = this.capValue(value, this.cap);
                values.push(cappedValue);
            } else {
                values.push(undefined);
            }
        });
        return values;
    }

    private getDataSets(labels: Array<string>): ChartDataSets[] {
        const dataset: ChartDataSets[] = [];

        Util.each(this.datasets, (index: number, logDataSet: ChartDataSet) => {
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
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                        max: this.cap
                    }
                }]
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
        const numericHash: number = this.hashCode(str);
        
        var colour: string = '#';
        for (var charIndex = 0; charIndex < 3; charIndex++) {
            var value = (numericHash >> (charIndex * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }
    
    private hashCode(str: string): number {
        let hash: number = 0;
        let chr;
        for (let index = 0; index < str.length; index++) {
            chr = str.charCodeAt(index);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
}
