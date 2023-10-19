// const data = useMemo(() => {
//   if (signalsArray) {
//     return Array.from(signalsArray)?.map((number: number, index) => {
//       return { name: number, value: String(index) };
//     });
//   }
// }, [signalsArray]);

// console.log(data?.map((d) => d.name));

// const parentWidth = 500;

// const margins = {
//   top: 20,
//   right: 20,
//   bottom: 20,
//   left: 20,
// };

// const width = parentWidth - margins.left - margins.right;
// const height = 200 - margins.top - margins.bottom;

// const ticks = 50;
// const t = transition().duration(1);

// const xScale = scaleBand()
//   .domain(data?.map((d) => d.name) ?? [])
//   .rangeRound([0, width])
//   .padding(0.1);

// const yScale = scaleLinear()
//   .domain(extent(data?.map((d) => d.value) ?? []))
//   .range([height, 0])
//   .nice();

// const lineGenerator = line()
//   .x((d) => xScale(d.name))
//   .y((d) => yScale(d.value))
//   .curve(curveMonotoneX);

// <div>
//   {data && (
//     <svg
//       className="lineChartSvg"
//       width={width + margins.left + margins.right}
//       height={height + margins.top + margins.bottom}
//     >
//       <g transform={`translate(${margins.left}, ${margins.top})`}>
//         <XYAxis {...{ xScale, yScale, height, ticks, t }} />
//         <Line
//           data={data}
//           xScale={xScale}
//           yScale={yScale}
//           lineGenerator={lineGenerator}
//           width={width}
//           height={height}
//         />
//       </g>
//     </svg>
//   )}
// </div>
