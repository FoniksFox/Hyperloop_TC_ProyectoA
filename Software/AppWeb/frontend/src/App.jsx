import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { WebSocketProvider } from './websocket/WebSocketProvider'

import Home from './pages/Home/Home'
import Dev from './pages/Dev/Dev'


function App() {

  	return (
		<WebSocketProvider url="ws://localhost:8765">
			<Router basename="/">
				<Routes>
					<Route path="/" element={<Home/>} />
					<Route path="/dev" element={<Dev/>} />
				</Routes>
			</Router>
		</WebSocketProvider>
  	)
};

export default App;
