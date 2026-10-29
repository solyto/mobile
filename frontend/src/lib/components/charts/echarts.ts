// Registers only the echarts parts the charts use, so the bundle doesn't carry
// the whole library. A chart option using anything else (a new series type,
// dataZoom, markLine, ...) needs its module added here.
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

use([
	BarChart,
	LineChart,
	PieChart,
	GridComponent,
	LegendComponent,
	TitleComponent,
	TooltipComponent,
	LegacyGridContainLabel, // grid.containLabel, which every chart sets
	CanvasRenderer
]);

export { init } from 'echarts/core';
export type { ECharts } from 'echarts/core';
