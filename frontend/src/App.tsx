import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Editor } from './Pages/Editor';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Editor />}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
 