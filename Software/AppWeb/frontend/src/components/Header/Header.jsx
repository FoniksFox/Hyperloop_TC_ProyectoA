import './Header.css';
import { useNavigate } from 'react-router-dom';

function Header({ toggleSidebar }) {
    const navigate = useNavigate();

    return (
        <div className="header">
            <button className="sidebar-toggle" onClick={() => toggleSidebar()}>
                <span className="sidebar-toggle-icon"><img src='/menu-burger.svg' alt="Menu Burger"/></span>
            </button>
            <h1 className="header-title" onClick={() => { navigate("/") }}>Hyperloop TC group A</h1>
            <button className="header-tools" onClick={() => {}}>
                <span className="header-tools-icon">Tools</span>
            </button>
            <button className="header-settings" onClick={() => {}}>
                <span className="header-settings-icon">Settings</span>
            </button>
        </div>
    )
}

export default Header;