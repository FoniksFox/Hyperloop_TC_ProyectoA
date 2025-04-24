import './Header.css';
import menuBurger from '../../../public/menu-burger.svg';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    return (
        <div className="header">
            <button className="sidebar-toggle" onClick={() => {}}>
                <span className="sidebar-toggle-icon"><img src={menuBurger} alt="Menu Burger"/></span>
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