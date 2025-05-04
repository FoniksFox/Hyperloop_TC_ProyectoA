import './WSButton.css';
import PrechargeIcon from '../../assets/zap.svg?react';
import DischargeIcon from '../../assets/zap-off.svg?react';
import StartLevitationIcon from '../../assets/chevrons-up.svg?react';
import StopLevitationIcon from '../../assets/chevrons-down.svg?react';
import StartMotor from '../../assets/play.svg?react';
import StopMotor from '../../assets/pause.svg?react';
import { useContext } from 'react';
import { WebSocketContext } from '../../websocket/WebSocketProvider';

function WSButton({ command, name}) {
    const { sendOrder } = useContext(WebSocketContext);
    const icons = {
        precharge: PrechargeIcon,
        discharge: DischargeIcon,
        'start levitation': StartLevitationIcon,
        'stop levitation': StopLevitationIcon,
        'start motor': StartMotor,
        'stop motor': StopMotor,
    };
    if (!name) {
        name = command.charAt(0).toUpperCase() + command.slice(1);
    }

    const Icon = icons[command] || null;

    return (
        <button className="ws-button" onClick={() => sendOrder(command)}>
            {Icon && <Icon className="ws-button-icon" />}
            <p className="ws-button-text">{name}</p>
        </button>
    );
}

export default WSButton;