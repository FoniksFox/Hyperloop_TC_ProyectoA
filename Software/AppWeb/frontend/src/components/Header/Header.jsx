import './Header.css';
import { useNavigate } from 'react-router-dom';
import SidebarIcon from '../../assets/sidebar.svg?react';
import ConfIcon from '../../assets/settings.svg?react';
import ToolsIcon from '../../assets/tool.svg?react';

function Header({ toggleSidebar }) {
    const navigate = useNavigate();

    return (
        <div className="header">
            <button className="sidebar-toggle" onClick={() => toggleSidebar()}>
                <SidebarIcon className="sidebar-icon"/>
            </button>
            <h1 className="header-title" onClick={() => { navigate("/") }}>Hyperloop TC group A</h1>
            <button className="header-tools" onClick={() => {}}>
                <ToolsIcon className="sidebar-icon"/>
            </button>
            <button className="header-settings" onClick={() => {}}>
                <ConfIcon className="sidebar-icon"/>
            </button>
        </div>
    )
}

export default Header;