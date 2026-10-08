import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import Provider from './components/Provider';
import SideMenu from './components/SideMenu';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider  } from './components/SidebarContext'; 
import { UserProvider } from "./components/UserContext";

function App() {
  return (
    <UserProvider style={{
      transform: "scale(0.67)",
      transformOrigin: "0 0",  
      width: `${100 / 0.67}%`,  
    }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/provider"
          element={
            <SidebarProvider>
              <div style={{ display: "flex" }}>
                <SideMenu />
                <Provider />
              </div>
            </SidebarProvider>
          }
        />
      </Routes>
    </UserProvider>
  );
}

export default App;
