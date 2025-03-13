import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Editor } from './Pages/Editor';
import { Sidebar } from './Pages/Sidebar';

function App() {

  return (
    <div id='main-container'>
      <Router>
        <Routes>
          <Route path='/' element={<><Sidebar /><Editor /></>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
 