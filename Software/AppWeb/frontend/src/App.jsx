import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { WebSocketProvider } from './websocket/WebSocketProvider'

import Home from './pages/Home/Home'
import Dev from './pages/Dev/Dev'


function App() {
	const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/`;

  	return (
		<WebSocketProvider url="ws://localhost/api">
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
