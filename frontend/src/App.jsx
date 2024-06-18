import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import View from './pages/View';
import ViewPost from './pages/ViewPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/view" element={<View />} />
        <Route path="/view/:postId" element={<ViewPost />} />
      </Routes>
    </Router>
  );
}

export default App;
