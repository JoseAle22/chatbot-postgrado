"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage"
import AdminChatView from "./components/AdminChatView"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminChatView />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
