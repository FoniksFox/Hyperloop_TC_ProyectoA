import './Console.css';
import { useState, useReducer, useContext, useRef, useCallback, useEffect } from 'react';
import { WebSocketContext } from '../../websocket/WebSocketProvider';

function Console() {
    const { isConnected, subscribe, sendOrder } = useContext(WebSocketContext);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [unsubcribe, setUnsubscribe] = useState(null);
    const toggleSubscription = useCallback(() => {
        if (isSubscribed) {
            if (unsubcribe) {
                unsubcribe();
            }
            setIsSubscribed(false);
            setUnsubscribe(null);
            return;
        } else {
            const aux = subscribe((newMessage) => dispatch({ type: 'message', data: newMessage }))
            setIsSubscribed(true);
            setUnsubscribe(() => aux);
        }
    });
    const getStatus = useCallback(() => {
        if (!isSubscribed) {
            return 'Nay';
        } else if (!isConnected) {
            return 'Yay';
        } else {
            return 'Yeah';
        }
    }, [isSubscribed, isConnected]);

    const messagesLimit = 300;
    const messagesKey = useRef(0);
    const setMessagesKey = useCallback((value) => {
        if (value === undefined) {
            if (messagesKey.current >= messagesLimit) {
                messagesKey.current = 0;
            } else {
                messagesKey.current += 1;
            }
        } else {
            messagesKey.current = value;
        }
        return messagesKey.current;
    }, []);
    const [messages, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'message':
                const messageKey = setMessagesKey();
                let timestamp = action.data.timestamp;
                const ms = ("00" + timestamp.getMilliseconds()).slice(-3);
                timestamp = timestamp.toLocaleTimeString() + ":" + ms;
                let message = { ...action.data, key: messageKey, timestamp: timestamp };
                const id = message.id;
                if (id) {
                    message = { key: messageKey, type: 'message', id: id, data: message.data, timestamp: timestamp};
                }
                let newState = [...state, message];
                if (newState.length > messagesLimit) {
                    newState = newState.slice((newState.length-messagesLimit));
                }
                return newState;
            case 'clear':
                setMessagesKey(0);
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
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                consoleContentRef.current.scrollTop = scrollHeight;
            }
        }
    }, [messages]);

    const [filtersVisible, setFiltersVisible] = useState(false);
    const filtersRef = useRef(null);
    const [filters, setFilters] = useState({ connection: true, message: true, error: true, order: true });
    const messageFiltersRef = useRef(filters);
    const [messageFilters, setMessageFilters] = useState({ data: true, other: true });

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
                <div className="console-indicator">{getStatus()}</div>
                <div className="console-header-managers">
                    <button className="console-clear" onClick={() => dispatch({ type: 'clear' })}>Cl</button>
                    <button className="console-connect" onClick={toggleSubscription}>S</button>
                    <div className="console-filters">
                        <button className="console-config" onClick={() => setFiltersVisible(!filtersVisible)}>F</button>
                        <div className="console-filters-content" ref={filtersRef} style={{ visibility: filtersVisible ? 'visible' : 'hidden' }}>
                            <label>
                                <input type="checkbox" checked={filters.connection} onChange={() => setFilters({ ...filters, connection: !filters.connection })} />
                                Connection
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.message} onChange={() => setFilters({ ...filters, message: !filters.message })} />
                                Message
                                <div className="console-filters-subcontent" ref={messageFiltersRef} style={{ visibility: (filters.message && filtersVisible) ? 'visible' : 'hidden' }}>
                                    <label>
                                        <input type="checkbox" checked={messageFilters.data} onChange={() => setMessageFilters({ ...messageFilters, data: !messageFilters.data })} />
                                        Data
                                    </label>
                                    <label>
                                        <input type="checkbox" checked={messageFilters.other} onChange={() => setMessageFilters({ ...messageFilters, other: !messageFilters.other })} />
                                        Other
                                    </label>
                                </div>
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.error} onChange={() => setFilters({ ...filters, error: !filters.error })} />
                                Error
                            </label>
                            <label>
                                <input type="checkbox" checked={filters.order} onChange={() => setFilters({ ...filters, order: !filters.order })}/>
                                Order
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="console-content" ref={consoleContentRef}>
                <div className="scroll-helper">
                    {messages.filter((message) => {
                        if (!filters[message.type]) return false;
                        if (message.type === 'message' && message.id) {
                            return messageFilters[message.id];
                        } else {
                            return true;
                        }
                    }).map((message) => (
                        <div key={message.key} className={`console-message ${message.type} ${message.id? message.id : ''}`}>
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