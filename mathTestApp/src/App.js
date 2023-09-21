import './App.css';
import {BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import TestPage from './components/TestPage/TestPage';
const  App = () => {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route exact path='/' element={<LandingPage/>}/>
            <Route path = '/test' element = {<TestPage/>}/>
          </Routes>
        </Router>
    </div>
  );
}

export default App;
