// useEffect(() => {
//   // if (data === undefined) return;
//   if (edf) {
//     const plot = Plot.plot({
//       width: 2000,
//       height: 800,
//       marginLeft: 45,
//       style: "background: black; color: white;",
//       // x: {
//       //   type: "log",
//       //   tickFormat: (d) => `${d > 1 ? "+" : ""}${Math.round(100 * (d - 1))}%`,
//       //   grid: true,
//       //   ticks: 12,
//       // },
//       marks: [Plot.lineY(edf?.getPhysicalSignalConcatRecords(0, 0, 1280))],
//     });
//     containerRef.current.append(plot);
//     return () => plot.remove();
//   }
// }, [edf]);
