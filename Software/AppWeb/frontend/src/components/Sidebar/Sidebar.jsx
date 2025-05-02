import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Sidebar({ isActive }) {
    const navigate = useNavigate();

    return (
        isActive === true ? 
            <div className="sidebar">
            <ul className="sidebar-group links">
                <li className="sidebar-item" onClick={() => { navigate("/") }}>
                    <span className="sidebar-item-icon">🏠</span>
                </li>
                <li className="sidebar-item" onClick={() => { navigate("/dev") }}>
                    <span className="sidebar-item-icon">📁</span>
                </li>
            </ul>
            <ul className="sidebar-group tools">
                <li className="sidebar-item" onClick={() => {}}>
                    <span className="sidebar-item-icon">⚙️</span>
                </li>
            </ul>
        </div>
        : null
    );
}

export default Sidebar;