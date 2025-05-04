import './Dev.css';
import { useState } from 'react';

import Header from '../../components/Header/Header.jsx';
import ColumnsContainer from '../../components/ColumnsContainer/ColumnsContainer.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';

function Dev() {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const toggleSidebar = () => {
        setSidebarActive(!isSidebarActive);
    };

    return (
        <div className="dev">
            <Header toggleSidebar={toggleSidebar}/>
            <div className="dev__content">
                <Sidebar isActive={isSidebarActive}/>
                <ColumnsContainer/>
            </div>
        </div>
    );
}

export default Dev;