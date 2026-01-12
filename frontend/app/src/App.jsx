import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import HomePageOrg from './pages/HomePageOrg';
import CallbackPage from './pages/CallbackPage';
import AdminPage from './pages/AdminPage';  // ← DODAJ OVO

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/stipendije" element={<HomePage />} />
          <Route path="/" element={<LoginAndRegisterPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/org" element={<HomePageOrg />} />
          <Route path="/admin" element={<AdminPage />} />  {/* ← DODAJ OVO */}
        </Routes>
      </Router> 
    </>
  );
}

export default App;