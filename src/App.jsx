import { Routes, Route } from 'react-router-dom';
import Treemap from './Treemap';

function App() {
  return (
      <Routes>
        <Route path='/treemap-diagram' element={<Treemap />} />
        <Route path="/treemap-diagram/:id" element={<Treemap />} />
      </Routes>
  );
}

export default App;