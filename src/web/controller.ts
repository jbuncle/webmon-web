import { Util } from './util';
import { ChartBuilder } from './chartbuilder';
import { Api, ApiLogFile, ApiLogEntry, ApiLogFileInfo } from './api';
import { ChartSeries } from './chartbuilder';
import { SelectBox } from './selectbox';

export class Controller {

    private chart: ChartBuilder | undefined;
    
    private cap: number = 600;
    
    private logsByDate: { [key: string]: ApiLogFileInfo[] } | undefined;

    public constructor(
        private readonly api: Api,
        private readonly container: HTMLElement,
        private readonly dropDown: SelectBox,
    ) {

    }

    public init(): void {
        this.dropDown.onChange((ev: Event) => {
            const value = this.dropDown.getValue();
            this.renderChart(value, this.logsByDate[value]);
        });
        // Get list items
        this.api.list().then((logsByDate: { [key: string]: ApiLogFileInfo[] }) => {
            this.logsByDate = logsByDate;
            
            Util.items(logsByDate, (date: string, logInfos: ApiLogFileInfo[]) => {
               this.dropDown.addOption(date, date); 
            });
        });
    }
       
    public updateCap(cap: number): void {
        this.cap = cap;
    }

    private renderChart(date: string, logInfos: ApiLogFileInfo[]) {
        const urls: string[] = logInfos.map((logInfo: ApiLogFileInfo) => {
            return logInfo.path;
        });
        let chartBuilder ;
        if (this.chart !== undefined) {
            chartBuilder = this.chart;
            chartBuilder.setCap(this.cap);
        } else {
            chartBuilder = new ChartBuilder(this.createCanvas(), this.cap);
            this.chart = chartBuilder;
        }
            
        this.api.logs(urls).then((apiLogFiles: ApiLogFile[]) => {
            chartBuilder.clear();
            chartBuilder.update();
            Util.each(apiLogFiles, (index: number, apiLogFile: ApiLogFile) => {
                const seriesName: string = apiLogFile.info.domain;
                const seriesData: ChartSeries = this.entriesToSeries(apiLogFile.entries);
                chartBuilder.addDataset(seriesName, seriesData);
            });
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            chartBuilder.buildChart();
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