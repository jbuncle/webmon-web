import {Util} from './util';
import {ChartBuilder} from './chartbuilder';
import {Api, ApiLogFile, ApiLogEntry, ApiLogFileInfo} from './api';
import {ChartSeries} from './chartbuilder';

export class Controller {

    private readonly charts: ChartBuilder[] = [];

    public constructor(
        private readonly api: Api,
        private readonly container: HTMLElement,
    ) {

    }

    public updateCap(cap: number): void {
        Util.each(this.charts, (index: number, chart: ChartBuilder): void => {
            chart.setCap(cap);
            chart.update();
        });
    }

    public render(cap: number): void {
        this.api.list().then((logsByDate: {[key: string]: ApiLogFileInfo[]}) => {
            Util.items(logsByDate, (date: string, logInfos: ApiLogFileInfo[]) => {
                const urls: string[] = logInfos.map((logInfo: ApiLogFileInfo) => {
                    return logInfo.path;
                });
                const chartBuilder = new ChartBuilder(this.createCanvas(), cap);
                this.charts.push(chartBuilder);

                this.api.logs(urls).then((apiLogFiles: ApiLogFile[]) => {

                    Util.each(apiLogFiles, (index: number, apiLogFile: ApiLogFile) => {
                        const seriesName: string = apiLogFile.info.domain;
                        const seriesData: ChartSeries = this.entriesToSeries(apiLogFile.entries);
                        chartBuilder.addDataset(seriesName, seriesData);
                    });
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    chartBuilder.buildChart();
                })
            });
        });
    }

    private entriesToSeries(apiLogEntrys: ApiLogEntry[]): ChartSeries {
        const logAsSeries: ChartSeries = {};
        Util.each(apiLogEntrys, (index: number, entry: ApiLogEntry) => {
            logAsSeries[entry.timestamp] = entry.duration;
        });
        return logAsSeries;
    }

    private createCanvas(): HTMLCanvasElement {
        const chartCanvas: HTMLCanvasElement = document.createElement('canvas');
        this.container.appendChild(chartCanvas);
        return chartCanvas;
    }
}