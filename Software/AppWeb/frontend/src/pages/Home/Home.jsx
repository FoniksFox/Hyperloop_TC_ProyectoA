import './Home.css';
import { useState, useRef, useEffect } from 'react';

import Header from '../../components/Header/Header.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import Chart from '../../components/Chart/Chart.jsx';
import WSButton from '../../components/WSButton/WSButton.jsx';
import Console from '../../components/Console/Console.jsx';

function Home() {
    const [isSidebarActive, setSidebarActive] = useState(false);
    const toggleSidebar = () => {
        setSidebarActive(!isSidebarActive);
    };

    const chartWrapperRef = useRef(null);
    useEffect(() => {
        if (!chartWrapperRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === chartWrapperRef.current) {
                    const chartWrapperHeight = entry.contentRect.height;
                    const newHeight = chartWrapperHeight / 4 - 20 > 0 ? chartWrapperHeight / 4 - 20 : 0;
                    const charts = document.querySelectorAll('.chart-wrapper .chart');
                    charts.forEach(chart => {
                        chart.style.height = `${newHeight}px`;
                    });
                }
            }
        });
        observer.observe(chartWrapperRef.current);
        return () => {
            observer.disconnect();
        }
    }, [chartWrapperRef]);

    const [buttonCommand, setButtonCommand] = useState('');

    return (
        <div className="home">
            <Header toggleSidebar={() => toggleSidebar()}/>       
            <div className="page-body">
                <Sidebar isActive={isSidebarActive}/>
                <div className="content-wrapper">
                    <div className="content">
                        <div className="button-selector">
                            <WSButton command={buttonCommand || 'precharge'} />
                            <select onChange={(event) => {
                                console.log(event.target.value);
                                setButtonCommand(event.target.value);
                                event.target.value='';
                            }} defaultValue=''>
                                <option value="" disabled>Select a command</option>
                                <option value="precharge">Precharge</option>
                                <option value="start levitation">Start levitation</option>
                                <option value="start motor">Start motor</option>
                                <option value="stop motor">Stop motor</option>
                                <option value="stop levitation">Stop levitation</option>
                                <option value="discharge">Discharge</option>
                            </select>
                        </div>
                        <div className="simulation"></div>
                    </div>
                    <div className="content">
                        <div className="chart-wrapper" ref={chartWrapperRef}>
                            <Chart dataKey="voltage" yUnits="V" color="#ffff00" minY="0" maxY="500" />
                            <Chart dataKey="current" yUnits="A" color="#00ff00" minY="0" maxY="40" />
                            <Chart dataKey="elevation" yUnits="mm" color="#ff0000" minY="0" maxY="40" />
                            <Chart dataKey="velocity" yUnits="km/h" color="#0000ff" minY="0" maxY="40" />
                        </div>
                        <div className="console-wrapper">
                            <Console />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;