import { ChartContextProvider } from "./contexts/ChartContext";
import { HomeScreen } from "./components/screens/HomeScreen";

function App() {
  return (
    <ChartContextProvider>
      <HomeScreen />
    </ChartContextProvider>
  );
}

export default App;
