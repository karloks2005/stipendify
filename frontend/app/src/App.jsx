import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import HomePageOrg from './pages/HomePageOrg';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginAndRegisterPage />} />
          <Route path="/org" element={<HomePageOrg />} />
        </Routes>
      </Router> 
    </>
  );
}

export default App;