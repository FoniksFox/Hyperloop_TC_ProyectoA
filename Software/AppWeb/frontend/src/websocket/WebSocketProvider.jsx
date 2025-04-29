import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ url, children }) => {
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectInterval = 5000; // 5 seconds
    const messageSubscribers = useRef([]);
    const [isConnected, setIsConnected] = useState(false);

    const notifySubscribers = useCallback((message) => {
        const now = new Date();
        const ms = ("00" + now.getMilliseconds()).slice(-3);
        const timestamp = now.toLocaleTimeString() + ":" + ms;
        messageSubscribers.current.forEach((callback) => callback({ ...message, timestamp: timestamp }));
    }, []);

    const connect = useCallback(() => {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
            //console.log('WebSocket connection established');
            setIsConnected(true);
            notifySubscribers({ type: 'connection', status: true });
        };

        wsRef.current.onmessage = (event) => {
            //console.log('Message from server:', event);
            try {
                const parsedData = JSON.parse(event.data);
                notifySubscribers({ type: 'message', id: parsedData.id, data: parsedData.data });
            } catch (error) {
                console.error('Error parsing message:', error);
                notifySubscribers({ type: 'error', error: new Error('Error parsing message') });
                return;
            }
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            notifySubscribers({ type: 'error', error });
        };

        wsRef.current.onclose = () => {
            //console.log('WebSocket connection closed');
            notifySubscribers({ type: 'connection', status: false });
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(() => {
                connect(); // Attempt to reconnect
            }, reconnectInterval);
        };

    }, [url, notifySubscribers]);

    useEffect(() => {
        connect(); // Initial connection

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current); // Clear the timeout if the component unmounts
            }
            if (wsRef.current) {
                wsRef.current.close(); // Close the WebSocket connection
            }
        };
    }, [connect]);

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
            //console.log('Order sent:', orderName);
            notifySubscribers({ type: 'order', order: orderName });
        } else {
            console.error('WebSocket is not open. Unable to send order:', orderName);
            notifySubscribers({ type: 'error', error: new Error('WebSocket is not open. Unable to send order') });
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, sendOrder }}>
            {children}
        </WebSocketContext.Provider>
    );
};