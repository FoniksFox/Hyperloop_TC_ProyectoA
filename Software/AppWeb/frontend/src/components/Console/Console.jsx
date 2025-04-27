import './Console.css';
import { useState, useReducer, useContext, useRef, useCallback } from 'react';
import { WebSocketContext } from '../../websocket/WebSocketProvider';

function Console() {
    const { isConnected, subscribe, sendOrder } = useContext(WebSocketContext);
    const [messages, dispatch] = useReducer((state, action) => {
        console.log('Dispatching action:', action);
        console.log('Current state:', state);
        switch (action.type) {
            case 'message':
                return [...state, action.data];
            case 'clear':
                return [];
            default:
                return state;
        }
    }, []);
    const inputRef = useRef(null);
    const filtersRef = useRef(null);
    const [filters, setFilters] = useState({ connection: true, message: true, error: true });

    const stringifyMessage = useCallback((message) => {
        let messageString = '';
        messageString += message.timestamp ? `[${message.timestamp}] ` : '[?]';
        switch (message.type) {
            case 'connection':
                messageString += message.status ? 'WebSocket connected' : 'Websocket disconnected';
                break;
            case 'message':
                messageString += `Message: ${JSON.stringify(message.data)}`;
                break;
            case 'order':
                messageString += `Order: ${message.order.id} sent`;
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
                    <button className="console-connect" onClick={() => subscribe((newMessage) => dispatch({ type: 'message', data: newMessage }))}>Con</button>
                    <button className="console-config" onClick={() => filtersRef.current.style.visibility = filtersRef.current.style.visibility == 'visible' ? 'hidden' : 'visible'}>Conf</button>
                    <div className="console-filters" ref={filtersRef}>
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
                    </div>
                </div>
            </div>
            <div className="console-content">
                <div className="scroll-helper">
                    {messages.filter((message) => filters[message.type]).map((message, index) => (
                        <div key={index} className={`console-message ${message.type}`}>
                            {stringifyMessage(message)}
                        </div>
                    ))}
                </div>
            </div>
            <div className="console-sender">
                <input type="text" className="console-input" placeholder="Type your command here..." ref={inputRef}
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