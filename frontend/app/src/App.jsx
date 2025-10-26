import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginAndRegisterPage />} />
        </Routes>
      </Router> 
    </>
  );
}

export default App;