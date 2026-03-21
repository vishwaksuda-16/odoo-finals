import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Dashboard />

    </div>
  );
}

export default App;