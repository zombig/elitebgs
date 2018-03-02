import { Component, OnInit, Input } from '@angular/core';
import { EBGSFactionV3Schema } from '../../typings';
import { Options, LineChartSeriesOptions } from 'highcharts';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'app-faction-influence-chart',
    templateUrl: './faction-influence-chart.component.html'
})

export class FactionInfluenceChartComponent implements OnInit {
    @Input() factionData: EBGSFactionV3Schema;
    options: Options;
    chart: Chart;
    constructor() { }

    ngOnInit(): void {
        const history = this.factionData.history;
        const allSystems: string[] = [];
        history.forEach(element => {
            if (allSystems.indexOf(element.system) === -1) {
                allSystems.push(element.system);
            }
        });
        const series: LineChartSeriesOptions[] = [];
        history.sort((a, b) => {
            if (a.updated_at < b.updated_at) {
                return -1;
            } else if (a.updated_at > b.updated_at) {
                return 1;
            } else {
                return 0;
            }
        });
        allSystems.forEach(system => {
            const data: [number, number][] = [];
            history.forEach(element => {
                if (element.system === system) {
                    data.push([
                        Date.parse(element.updated_at),
                        Number.parseFloat((element.influence * 100).toFixed(2))
                    ]);
                } else {
                    if (element.systems.findIndex(systemElement => {
                        return systemElement.name === system;
                    }) === -1) {
                        data.push([Date.parse(element.updated_at), null]);
                    }
                }
            });
            series.push({
                name: system,
                data: data
            });
        });
        this.options = {
            xAxis: { type: 'datetime' },
            yAxis: {
                title: {
                    text: 'Influence'
                }
            },
            title: { text: 'Influence trend' },
            series: series
        };
        this.chart = new Chart(this.options);
    }
}