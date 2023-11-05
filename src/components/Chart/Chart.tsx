import { useContext, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import autocolors from "chartjs-plugin-autocolors";
import { Button, styled as muiStyled } from "@mui/material";
import styled from "styled-components";
import { ChartContext } from "../../contexts/ChartContext";

interface Props {
  edf: any;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  // TODO: look into colors, currently they are too similar
  autocolors
);

export const Chart = ({ edf }: Props) => {
  const { selectedSignals } = useContext(ChartContext);
  const chartRef = useRef(null);

  const numberOfSamples = edf?.getSignalNumberOfSamplesPerRecord(0); // those will be the same for every signal
  const recordDuration = edf?.getRecordDuration();
  const durationOneSample = numberOfSamples / recordDuration;
  const numberOfRecords = edf?.getNumberOfRecords();
  const microVoltUnit = edf?.getSignalPhysicalUnit(0); // same for all signals

  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      datasets: {
        line: {
          pointRadius: 0,
          cubicInterpolationMode: "monotone" as const,
          lineTension: 0.1,
          borderJoinStyle: "round" as const,
        },
      },
      events: [],
      animation: false,
      scales: {
        x: {
          type: "linear",
          ticks: {
            callback: function (value: number) {
              return value + "s";
            },
          },
        },
        y: {
          ticks: {
            callback: function (value: number) {
              return `${value} ${microVoltUnit}`;
            },
          },
        },
      },
      plugins: {
        tooltip: {
          events: [],
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
            modifierKey: "shift",
          },
        },
      },
      spanGaps: true,
    };
  }, []);

  const xLabels = useMemo(() => {
    const data = [];
    const length = edf?.getPhysicalSignalConcatRecords(
      0,
      0,
      numberOfRecords
    ).length;

    for (let i = 0; i < length; i++) {
      const fractions = i / durationOneSample; // 1/Xth second interval
      data.push(fractions);
    }
    return data;
  }, [edf, durationOneSample]);

  const data = useMemo(() => {
    const datasets = selectedSignals.map((signalIndex) => ({
      label: edf?.getSignalLabel(signalIndex),
      data: edf?.getPhysicalSignalConcatRecords(
        signalIndex,
        0,
        numberOfRecords
      ),
    }));

    return {
      labels: xLabels,
      datasets,
    };
  }, [selectedSignals, edf, numberOfRecords, xLabels]);

  return (
    <>
      <Container>
        <Line options={options} data={data} ref={chartRef} />
      </Container>
      <ResetButton onClick={handleResetZoom} variant="contained">
        Reset zoom
      </ResetButton>
    </>
  );
};

const ResetButton = muiStyled(Button)({
  backgroundColor: "red",
});

const Container = styled.div`
  position: relative;
  height: 80vh;
  width: 80vw;
`;
