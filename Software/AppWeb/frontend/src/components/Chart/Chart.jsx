import './Chart.css';
import { WebSocketContext } from '../../websocket/WebSocketProvider';
import { useReducer, useContext, useEffect, useCallback, useRef, useState } from 'react';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';

function Chart( { title, dataKey, yUnits}) {
    if (!title) {
        title = dataKey.charAt(0).toUpperCase() + dataKey.slice(1);
    }
    const { isConnected, subscribe} = useContext(WebSocketContext);

    const line = useRef(new TimeSeries());

    const subscribeToData = useCallback(() => {
        const unsubscribe = subscribe((newMessage) => {
            if (newMessage.type !== 'message' || newMessage.id !== 'data') {
                return;
            }
            line.current.append(newMessage.timestamp, newMessage.data[dataKey]);
        });
        return unsubscribe;
    }, [subscribe]);
    useEffect(() => {
        const unsubscribe = subscribeToData();
        return () => {
            unsubscribe();
        };
    }, [subscribeToData]);

    return (
        <div className ="chart-container">
            <h3>{title || "Chart"}</h3>
            <SmoothieComponent
                display="undefined"
                responsive={true}
                height={100}
                millisPerPixel={100}
                interpolation="bezier"
                streamDelay={100}
                grid={{
                    fillStyle: 'transparent',
                }}
                tooltip={true}
                tooltipLine={{
                    lineWidth: 2,
                }}
                timestampFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleTimeString() + ':' + ("00" + date.getMilliseconds()).slice(-3);
                }}
                series={[
                    {
                        data: line.current,
                        strokeStyle: '#00ff00',
                        fillStyle: 'rgba(0, 255, 0, 0.2)',
                        lineWidth: 2,
                        label: dataKey,
                    },
                ]}
            />
        </div>
    );
}

export default Chart;