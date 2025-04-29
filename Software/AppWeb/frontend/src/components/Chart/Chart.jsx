import './Chart.css';
import { WebSocketContext } from '../../websocket/WebSocketProvider';
import { useReducer, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Chart( { title, dataKey, yUnits}) {
    const { isConnected, subscribe} = useContext(WebSocketContext);
    const yRange = useRef([0, 0]);
    const xRange = useRef(10000); // 10 seconds
    const [data, setData] = useReducer((state, action) => {
        switch (action.type) {
            case 'data':
                let newData = action.data[dataKey];
                const maxX = action.timestamp.getTime();
                if (newData === undefined || newData === null || maxX === undefined || maxX === null) {
                    console.error('Invalid data received:', action.data);
                    return state;
                }
                let newState = [...state, {yKey: newData, xKey: maxX}];
                newState = newState.filter((item) => item.xKey >= maxX - xRange.current - 1000); // 1 second tolerance for smoother chart
                return newState;
            case 'clear':
                return [];
            default:
                return state;
            }
    }, []);
    const subscribeToData = useCallback(() => {
        const unsubscribe = subscribe((newMessage) => {
            if (newMessage.type !== 'message' || newMessage.id !== 'data') {
                return;
            }
            setData({ type: 'data', data: newMessage.data, timestamp: newMessage.timestamp });
        });
        return unsubscribe;
    }, [subscribe]);
    useEffect(() => {
        const unsubscribe = subscribeToData();
        return () => {
            unsubscribe();
        };
    }, [subscribeToData]);

    const [ticks, setTicks] = useState([]);
    useEffect(() => {
        if (data.length > 0) {
            const domainEnd = data[data.length - 1].xKey;
            const domainStart = domainEnd - xRange.current;
            const tickCount = 5;
            const tickInterval = (domainEnd - domainStart) / tickCount;
            const newTicks = Array.from({ length: tickCount + 1 }, (_, i) => domainStart + i * tickInterval);
            setTicks(newTicks);
            //console.log("Ticks:", newTicks);
        }
    }, [data]);


    return (
        <div className="chart-container">
            <h3>{title || "Chart"}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} >
                    <Line type="monotone" dataKey="yKey" stroke="#8884d8" />
                    <XAxis 
                        dataKey="xKey"
                        tickFormatter={(tick) => {
                            const date = new Date(tick);
                            return `${date.getMinutes()}:${("00" + date.getSeconds()).slice(-2)}:${("00" + date.getMilliseconds()).slice(-3, -1)}`;
                        }}
                        //ticks={ticks}
                        //interval={10000}
                        name="Time" 
                        domain={
                            data.length > 0 ? [
                                data[data.length - 1].xKey - xRange.current,
                                data[data.length - 1].xKey
                            ] : [0, 0]
                        }
                    />
                    <YAxis tickFormatter={(tick) => `${tick}${yUnits || ""}`} name="Value"/>
                    <CartesianGrid strokeDasharray="5 2" />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default Chart;