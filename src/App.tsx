import { ChartContextProvider } from "./contexts/ChartContext";
import { HomeScreen } from "./components/screens/HomeScreen";
import { UserContextProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserContextProvider>
      <ChartContextProvider>
        <HomeScreen />
      </ChartContextProvider>
    </UserContextProvider>
  );
}

export default App;
