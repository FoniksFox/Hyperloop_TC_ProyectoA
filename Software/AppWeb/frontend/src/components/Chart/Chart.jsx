import './Chart.css';
import { WebSocketContext } from '../../websocket/WebSocketProvider';
import { useReducer, useContext, useEffect, useCallback, useRef, useState } from 'react';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';

function Chart( { title, dataKey, yUnits, color, height, minY, maxY } ) {
    if (!title){
        title = dataKey.charAt(0).toUpperCase() + dataKey.slice(1) + ' (' + yUnits + ')';
    }
    if (!color){
        color = '#00ff00';
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
            <SmoothieComponent
                className="chart"
                title={{
                    text: title || "Chart",
                    fontSize: 20,
                    textAlign: 'left',
                    verticalAlign: 'top',
                }}
                responsive={true}
                height={height || 0}
                millisPerPixel={30}
                streamDelay={100}
                grid={{
                    fillStyle: 'transparent',
                }}
                tooltip={false}
                tooltipLine={{
                    lineWidth: 2,
                }}
                timestampFormatter={(value) => {
                    const date = new Date(value);
                    return ('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2);
                }}
                series={[
                    {
                        data: line.current,
                        strokeStyle: color,
                        fillStyle: color.replace(/^(#?)([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, (_, hash, r, g, b) => 
                            `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.3)`),
                        lineWidth: 2,
                    },
                ]}
                minValue={minY}
                maxValue={maxY}
            />
        </div>
    );
}

export default Chart;