import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ url, children }) => {
    const wsRef = useRef(null);
    const messageSubscribers = useRef([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
            console.log('WebSocket connection established');
            setIsConnected(true);
            // Notify all subscribers about the connection
            messageSubscribers.current.forEach((callback) => callback({ type: 'connection', status: true }));
        };

        wsRef.current.onmessage = (event) => {
            console.log('Message from server:', event);
            // Dispatch the event to all subscribed callbacks
            messageSubscribers.current.forEach((callback) => callback({ type: 'message', data: event }));
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Notify all subscribers about the error
            messageSubscribers.current.forEach((callback) => callback({ type: 'error', error }));
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket connection closed');
            // Notify all subscribers about the disconnection
            messageSubscribers.current.forEach((callback) => callback({ type: 'connection', status: false }));
            setIsConnected(false);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url]);

    const subscribe = useCallback((callback) => {
        messageSubscribers.current.push(callback);
        return () => {
            messageSubscribers.current = messageSubscribers.current.filter((cb) => cb !== callback);
        };
    }, []);

    const sendOrder = useCallback((orderName) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const order = { id: orderName };
            wsRef.current.send(JSON.stringify(order));
            console.log('Order sent:', orderName);
            // Notify all subscribers about the order sent
            messageSubscribers.current.forEach((callback) => callback({ type: 'order', order }));
        } else {
            console.error('WebSocket is not open. Unable to send order:', orderName);
            // Notify all subscribers about the error
            messageSubscribers.current.forEach((callback) => callback({ type: 'error', error: new Error('WebSocket is not open. Unable to send order') }));
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, sendOrder }}>
            {children}
        </WebSocketContext.Provider>
    );
};