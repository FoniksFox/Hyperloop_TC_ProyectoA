import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home/Home'
import Dev from './pages/Dev/Dev'

import { logMessage } from './components/Console/Console'
import { updateSensorData } from './components/Charts/Charts'

function App() {
  	const ws = new WebSocket('ws://localhost:8765/ws');
	ws.onopen = () => {
		console.log('WebSocket connection established');
		logMessage('WebSocket connection established', 'info');
	};
	ws.onmessage = handleWebSocketMessage;
	ws.onerror = (error) => {
		console.error('WebSocket error:', error);
		logMessage('WebSocket error', 'error');
	}
	ws.onclose = () => {
		console.log('WebSocket connection closed');
		logMessage('WebSocket connection closed', 'info');
	}

  	return (
    	<Router>
      		<Routes>
        		<Route path="/" element={<Home/>} />
        		<Route path="/dev" element={<Dev/>} />
      		</Routes>
    	</Router>
 	);
}

function handleWebSocketMessage(event) {
	const msg = JSON.parse(event.data);
	console.log('Message from server:', msg);
	if (msg.id === 'data') {
		if (msg.data) {
			logMessage(`Data received: ${msg.data}`, 'info');
			updateSensorData(msg.data);
		} else {
			logMessage('No data received', 'error');
		}
	} else if (msg.id === 'info') {
		if (msg.data && msg.data.trim() !== "") {
			logMessage(`INFO: ${msg.data}`, msg.severity);
		} else {
			logMessage('No info message received', 'error');
		}
	} else {
		console.warn('Unknown message type:', msg);
		logMessage('Unknown message type', 'error');
	}
}

function sendOrder(orderName) {
	if (ws && ws.readyState === WebSocket.OPEN) {
		const order = {id: orderName};
		ws.send(JSON.stringify(order));
		logMessage(`Order sent: ${orderName}`, 'info');
	} else {
		logMessage('WebSocket is not open. Cannot send order.', 'error');
	}
}

export default App
