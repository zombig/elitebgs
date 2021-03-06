import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EBGSFactionSchema } from '../typings';
// import { Options, XRangeChartSeriesOptions, DataPoint, SeriesChart } from 'highcharts';
import { Chart } from 'angular-highcharts';
import { ThemeService } from '../services/theme.service';
import { IngameIdsService } from '../services/ingameIds.service';

// declare module 'highcharts' {
//     interface XRangeChart extends SeriesChart {
//         borderRadius?: number;
//         grouping?: boolean;
//     }

//     interface PlotOptions {
//         xrange: XRangeChart;
//     }

//     interface DataPoint {
//         x2: number
//     }

//     interface XRangeChartSeriesOptions extends IndividualSeriesOptions, SeriesChart { }
// }

@Component({
    selector: 'app-faction-state-chart',
    templateUrl: './faction-state-chart.component.html'
})
export class FactionStateChartComponent implements OnInit, OnChanges {
    @Input() factionData: EBGSFactionSchema;
    // options: Options;
    options: any;
    chart: Chart;
    constructor(
        private themeService: ThemeService,
        private ingameIdsService: IngameIdsService
    ) { }

    ngOnInit(): void {
        this.createChart()
    }

    async createChart() {
        // Copied over to server\routes\chart_generator.js
        const allSystems: string[] = [];
        this.factionData.history.forEach(record => {
            if (allSystems.indexOf(record.system) === -1) {
                allSystems.push(record.system);
            }
        });
        this.factionData.history.sort((a, b) => {
            if (a.updated_at < b.updated_at) {
                return -1;
            } else if (a.updated_at > b.updated_at) {
                return 1;
            } else {
                return 0;
            }
        });
        // const series: XRangeChartSeriesOptions[] = [];
        const series: any[] = [];
        const FDevIDs = await this.ingameIdsService.getAllIds().toPromise();
        const states: [string, string][] = Object.keys(FDevIDs.state).filter(state => {
            return state !== 'null';
        }).map(state => {
            return [state, FDevIDs.state[state].name];
        }) as [string, string][];
        let i = 0;
        states.forEach(state => {
            // const data: DataPoint[] = [];
            const data: any[] = [];
            allSystems.forEach((system, index) => {
                let previousState = '';
                let timeBegin = 0;
                let timeEnd = 0;
                this.factionData.history.forEach(record => {
                    if (record.system === system) {
                        if (previousState !== record.state) {
                            if (record.state === state[0]) {
                                timeBegin = Date.parse(record.updated_at);
                            }
                            if (previousState === state[0] && record.state !== state[0]) {
                                timeEnd = Date.parse(record.updated_at);
                                data.push({
                                    x: timeBegin,
                                    x2: timeEnd,
                                    y: index
                                });
                            }
                            previousState = record.state;
                        }
                    }
                });
                if (previousState === state[0]) {
                    data.push({
                        x: timeBegin,
                        x2: Date.now(),
                        y: index
                    });
                }
            });
            series.push({
                name: state[1],
                pointWidth: 20,
                data: data
            });
            i++;
        });
        this.options = {
            chart: {
                height: 130 + allSystems.length * 40,
                type: 'xrange'
            },
            title: {
                text: 'State Periods'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Systems'
                },
                categories: allSystems,
                reversed: true
            },
            plotOptions: {
                xrange: {
                    borderRadius: 0,
                    borderWidth: 0,
                    grouping: false,
                    dataLabels: {
                        align: 'center',
                        enabled: true,
                        format: '{point.name}'
                    },
                    colorByPoint: false
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size: 0.85em">{point.x} - {point.x2}</span><br/>',
                pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.yCategory}</b><br/>'
            },
            series: series,
            exporting: {
                enabled: true,
                sourceWidth: 1200
            }
        };
        this.themeService.theme$.subscribe(theme => {
            this.chart = new Chart(this.options);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        for (const propName in changes) {
            if (propName === 'factionData' && changes[propName].currentValue) {
                this.createChart();
            }
        }
    }
}
