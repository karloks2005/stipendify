import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import HomePageOrg from './pages/HomePageOrg';
import CallbackPage from './pages/CallbackPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/stipendije" element={<HomePage />} />
          <Route path="/" element={<LoginAndRegisterPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/org" element={<HomePageOrg />} />
        </Routes>
      </Router> 
    </>
  );
}

export default App;