<template>
  <v-app>
    <v-main>
      <v-card width="800">
        <InternalBarChart
          :chart-data="chartData()"
          :options="chartOptions()"
        />
      </v-card>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import InternalBarChart from '@/components/InternalBarChart.js';

import { sprintf } from 'sprintf-js';

export interface IDataPoint {
  x: any;
  y: number;
}

@Component({
  components: {InternalBarChart},
})
export default class App extends Vue {
  private data: object = [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2.5 },];
  private data2: object = [{ x: 0, y: 0.2 }, { x: 1, y: 0.4 }, { x: 2, y: 0.1 }, { x: 3, y: 0.6 },];
  private lines = [0.5, 0.8];
  private title = 'test1';

  public async created() {
    const self = this;
  }

  public mounted() {
    console.log("mounted App");

    this.data = this.data2;
    this.title = 'test2';
  }

  private chartOptions(): object {
    const self = this;

    const annotations = [];

    if (self.lines !== undefined && self.lines !== null) {

      for (const line of self.lines) {

        annotations.push({
          drawTime: 'afterDatasetsDraw',
          display: true,
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: line,
          borderColor: 'red',
          borderWidth: 4,
          label: {
            enabled: false,
            content: 'Test label',
          },
        });
      }
    }

    // chart js OPTIONS object. See https://www.chartjs.org/docs/latest/getting-started/usage.html
    return {
      title: {
        display: true,
        text: self.title,
      },
      animation: {
        duration: 0,
      },
      display: true,
      responsive: true,
      scales: {
        xAxes: [
          {
            type: "time",
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
            ticks: {
              major: {
                fontStyle: "bold",
                fontColor: "#FF0000",
              },
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "value",
            },
          },
        ],
      },
      annotation: {
        drawTime: "afterDatasetsDraw",
        annotations: annotations,
      },
    };
  }

  private chartData(): object {
    // chart js DATA object. See https://www.chartjs.org/docs/latest/getting-started/usage.html
    const self = this;

    const datasets = [];

    datasets.push({
      label: "Test",
      data: self.data,
      fill: false,
      borderWidth: 1,
    });

    return {
      datasets: datasets,
    };
  }
}
</script>

<style lang="less">

</style>
