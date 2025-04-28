import './Console.css';
import { useState, useReducer, useContext, useRef, useCallback, useEffect } from 'react';
import { WebSocketContext } from '../../websocket/WebSocketProvider';

function Console() {
    const { isConnected, subscribe, sendOrder } = useContext(WebSocketContext);
    const messagesLimit = 300;
    const [messages, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'message':
                let data = action.data;
                try {
                    const id = action.data.id;
                    data = { type: 'message', id: id, data: action.data.data, timestamp: action.data.timestamp };
                } catch (error) {}
                let newState = [...state, data];
                if (newState.length > messagesLimit) {
                    newState = newState.slice((newState.length-messagesLimit));
                }
                return newState;
            case 'clear':
                return [];
            default:
                return state;
        }
    }, []);
    const inputRef = useRef(null);
    const consoleContentRef = useRef(null);
    useEffect(() => {
        if (consoleContentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = consoleContentRef.current;
            console.log(scrollTop, scrollHeight, clientHeight);
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                console.log('scrolling to bottom');
                consoleContentRef.current.scrollTop = scrollHeight;
            }
        }
    }, [messages]);
    const filtersRef = useRef(null);
    const [filters, setFilters] = useState({ connection: true, message: true, error: true, order: true });

    const stringifyMessage = useCallback((message) => {
        let messageString = '-';
        messageString += message.timestamp ? `[${message.timestamp}] ` : '[?]';
        switch (message.type) {
            case 'connection':
                messageString += message.status ? 'WebSocket connected' : 'Websocket disconnected';
                break;
            case 'message':
                try {
                    const messageID = message.id;
                    if (messageID === 'data') {
                        messageString += 'Data received';
                    }
                } catch (error) {
                    messageString += `Message: ${JSON.stringify(message.data)}`;
                }
                break;
            case 'order':
                messageString += `Order: ${message.order} sent`;
                break;
            case 'error':
                messageString += `Error: ${message.error.message}`;
                break;
            default:
                messageString += JSON.stringify(message);
                break;
        }
        return messageString;
    }, []);

    return (
        <div className="console">
            <div className="console-header">
                <div className="console-indicator">{isConnected ? 'Yeah' : 'Nay'}</div>
                <div className="console-header-managers">
                    <button className="console-clear" onClick={() => dispatch({ type: 'clear' })}>Cl</button>
                    <button className="console-connect" onClick={() => subscribe((newMessage) => dispatch({ type: 'message', data: newMessage }))}>S</button>
                    <div className="console-filters">
                        <button className="console-config" onClick={() => filtersRef.current.style.visibility = filtersRef.current.style.visibility == 'visible' ? 'hidden' : 'visible'}>F</button>
                        <div className="console-filters-content" ref={filtersRef} style={{ visibility: 'hidden' }}>
                            <label>
                                <input type="checkbox" checked={filters.connection} onChange={() => setFilters({ ...filters, connection: !filters.connection })} />
                                Connection
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.message} onChange={() => setFilters({ ...filters, message: !filters.message })} />
                                Message
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.error} onChange={() => setFilters({ ...filters, error: !filters.error })} />
                                Error
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.order} onChange={() => setFilters({ ...filters, order: !filters.order })} />
                                Order
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="console-content" ref={consoleContentRef}>
                <div className="scroll-helper">
                    {messages.filter((message) => filters[message.type]).map((message, index) => (
                        <div key={index} className={`console-message ${message.type} ${message.id? message.id : ''}`}>
                            {stringifyMessage(message)}
                        </div>
                    ))}
                </div>
            </div>
            <div className="console-sender">
                <input type="text" className="console-input" placeholder="Type here..." ref={inputRef}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            sendOrder(inputRef.current.value);
                            inputRef.current.value = '';
                        }
                    }}
                />
                <button className="console-send-button" onClick={() => {sendOrder(inputRef.current.value); inputRef.current.value='';}}>Send</button>
            </div>
        </div>
    )
}

export default Console;