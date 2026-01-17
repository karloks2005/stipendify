import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import CallbackPage from './pages/CallbackPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/stipendije" element={<HomePage />} />
          <Route path="/" element={<LoginAndRegisterPage />} />
          <Route path="/dashboard" element={<AdminPage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </Router> 
    </>
  );
}

export default App;