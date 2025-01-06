import { ChartContextProvider } from "./contexts/ChartContext";
import { HomeScreen } from "./components/screens/HomeScreen";
import { UserContextProvider } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <UserContextProvider>
      <ChartContextProvider>
        <HomeScreen />
        <ToastContainer />
      </ChartContextProvider>
    </UserContextProvider>
  );
}

export default App;
