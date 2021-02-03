import { Line, Bar, mixins } from "vue-chartjs";
import * as ChartAnnotation from 'chartjs-plugin-annotation';

const { reactiveProp } = mixins;

export default {
  extends: Bar,
  mixins: [reactiveProp],
  plugins: [ChartAnnotation],
  props: ["chartData", "options"],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
