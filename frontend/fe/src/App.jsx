import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ECOList from "./pages/ECOList";
import ECOCreate from "./pages/ECOCreate";
import ECODetail from "./pages/ECODetail";
import ChangeView from "./pages/ChangeView";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import BOM from "./pages/BOM";
import BOMCreate from "./pages/BOMCreate";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import ECOStages from "./pages/ECOStages";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">

        {/* Sidebar always visible */}
        <Sidebar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/ecos" element={<ECOList />} />
          <Route path="/ecos/create" element={<ECOCreate />} />
          <Route path="/ecos/detail" element={<ECODetail />} />
          <Route path="/changes" element={<ChangeView />} />

          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<ProductCreate />} />

          <Route path="/bom" element={<BOM />} />
          <Route path="/bom/create" element={<BOMCreate />} />

          <Route path="/reporting" element={<Reporting />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/stages" element={<ECOStages />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;