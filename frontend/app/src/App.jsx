import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import LoginAndRegisterPage from './pages/LoginRegisterPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginAndRegisterPage />} />
          <Route path="/login" element={<LoginAndRegisterPage />} />
        </Routes>
      </Router>
      
    </>
  );
}

export default App;