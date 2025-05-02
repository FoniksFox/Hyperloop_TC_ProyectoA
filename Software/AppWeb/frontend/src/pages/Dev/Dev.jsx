import './Dev.css';
import Header from '../../components/Header/Header.jsx';
import ColumnsContainer from '../../components/ColumnsContainer/ColumnsContainer.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';

function Dev() {
    return (
        <div className="dev">
            <Header />
            <div className="dev__content">
                <Sidebar />
                <ColumnsContainer />
            </div>
        </div>
    );
}

export default Dev;