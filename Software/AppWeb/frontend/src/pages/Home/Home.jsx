import './Home.css';
import { useState, useRef, useEffect, useCallback } from 'react';

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

    const onProgress = useCallback((event) => {
        const progressBar = event.target.querySelector('.progress-bar');
        const updatingBar = event.target.querySelector('.update-bar');
        updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
        if (event.detail.totalProgress === 1) {
          progressBar.classList.add('hide');
          event.target.removeEventListener('progress', onProgress);
        } else {
          progressBar.classList.remove('hide');
        }
      }, []);
    useEffect(() => {
      document.querySelector('model-viewer')?.addEventListener('progress', onProgress);
        return () => {
            document.querySelector('model-viewer')?.removeEventListener('progress', onProgress);
            }
    }, [onProgress]);
    /*
    const animateModel = useCallback((position) => {
        const modelViewer = document.querySelector('model-viewer');

        // Wait for the model to load
        modelViewer.addEventListener('load', () => {
            const model = modelViewer.model; // Access the loaded 3D model
            console.log('Model loaded:', model);
            if (!model) {
                console.error('Model is undefined');
                return;
            }

            // Retrieve all symbols of the model
            const symbols = Object.getOwnPropertySymbols(model);
            console.log('Symbols in model:', symbols);

            // Find the Symbol(hierarchy)
            const symbol = symbols.find((sym) => sym.toString() === 'Symbol(roots)');

            if (!symbol) {
                console.error('Symbol not found');
                return;
            }

            // Access the hierarchy using the symbol
            const roots = model[symbol];
            console.log('Model roots:', roots);

            if (!roots) {
                console.error('Roots is undefined');
                return;
            }

            // Find the part by name in the hierarchy
            const movedPiece = roots.find((node) => {
                return node.name === 'SoporteConMovSTEP-1';
            }); // Replace with the actual name of the part
            console.log('Moved piece:', movedPiece);
            if (movedPiece !== undefined) {
                console.log('Moved piece found:', movedPiece);
                // Update the position of the part
                movedPiece.position.set(position.x, position.y, position.z);
            } else {
                console.error('Moved piece not found in the hierarchy');
            }
        });
    }, []);
    useEffect(() => {
        animateModel({ x: 0, y: 0, z: 0 });
    }, [animateModel]);
    */

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
                        <model-viewer src="model.glb" ar ar-modes="webxr scene-viewer quick-look" camera-controls tone-mapping="neutral" poster="poster.webp" shadow-intensity="1" camera-orbit="117.6deg 75.69deg 3.333m" field-of-view="30deg">
                            <div className="progress-bar hide" slot="progress-bar">
                                <div className="update-bar"></div>
                            </div>
                        </model-viewer>
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