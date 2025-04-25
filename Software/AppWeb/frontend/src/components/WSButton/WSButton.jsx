import './WSButton.css';
import { useContext } from 'react';
import { WebSocketContext } from '../../websocket/WebSocketProvider';

function WSButton({ command, name, icon }) {
    const { sendOrder } = useContext(WebSocketContext);
    if (!name) {
        name = command.charAt(0).toUpperCase() + command.slice(1);
    }
    return (
        <button className="ws-button" onClick={() => sendOrder(command)}>
            {icon && <img src={icon} alt={`${name} icon`} className="ws-button-icon" />}
            <p className="ws-button-text">{name}</p>
        </button>
    );
}

export default WSButton;