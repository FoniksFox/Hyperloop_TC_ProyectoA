import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '../../assets/home.svg?react';
import DevIcon from '../../assets/terminal.svg?react';
import ConfIcon from '../../assets/settings.svg?react';

function Sidebar({ isActive }) {
    const navigate = useNavigate();

    return (
        isActive === true ? 
            <div className="sidebar">
            <ul className="sidebar-group links">
                <li className="sidebar-item" onClick={() => { navigate("/") }}>
                    <HomeIcon className="sidebar-item-icon"/>
                </li>
                <li className="sidebar-item" onClick={() => { navigate("/dev") }}>
                    <DevIcon className="sidebar-item-icon"/>
                </li>
            </ul>
            <ul className="sidebar-group tools">
                <li className="sidebar-item" onClick={() => {}}>
                    <ConfIcon className="sidebar-item-icon"/>
                </li>
            </ul>
        </div>
        : null
    );
}

export default Sidebar;