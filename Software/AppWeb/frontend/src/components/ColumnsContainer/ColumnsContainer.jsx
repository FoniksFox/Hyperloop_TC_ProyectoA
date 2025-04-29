import './ColumnsContainer.css';
import { useState, useRef, useEffect, useCallback } from 'react';

import Column from '../Column/Column.jsx';
import WSButton from '../WSButton/WSButton.jsx';
import Console from '../Console/Console.jsx';
import Chart from '../Chart/Chart.jsx';

// Handle resizing, closing and opening of the columns (when minimized, they appear at the bottom of the screen as a bar)
function ColumnsContainer() {
    const containerRef = useRef(null);
    const columnsRef = useRef(Array(3).fill(null)); // Array to hold references to the column elements
    const [columns, setColumns] = useState([
        { id: 'charts', visible: true, width: 33},
        { id: 'buttons', visible: true, width: 34},
        { id: 'console', visible: true, width: 33},
    ]);
    
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === containerRef.current) {
                    let containerWidth = entry.contentRect.width;
                    let newWidths = columns.filter(column => column.visible).map((column, index) => {
                            const columnElement = columnsRef.current[index];
                            if (!columnElement) return 0; // Skip if the column element is not available
                            const width = columnElement.getBoundingClientRect().width;
                            return (width / containerWidth) * 100; // Convert to percentage
                    });
                    // Ensure that the widths sum to 100%
                    const totalWidth = newWidths.reduce((acc, width) => acc + width, 0);
                    if (totalWidth > 0) {
                        newWidths = newWidths.map(width => (width / totalWidth) * 100); // Normalize to 100%
                    }
                    let newColumns = columns.filter(column => column.visible).map((column, i) => ({ ...column, width: newWidths[i] }));
                    // Add the hidden columns
                    const hiddenColumns = columns.filter(column => !column.visible);
                    newColumns = newColumns.concat(hiddenColumns);
                    const columnsEqual = (cols1, cols2) => {
                        if (cols1.length !== cols2.length) return false;
                        for (let i = 0; i < cols1.length; i++) {
                            const a = cols1[i];
                            const b = cols2[i];
                            if (a.id !== b.id || a.visible !== b.visible || a.width !== b.width) {
                                return false;
                            }
                        }
                        return true;
                    };
                    if (!columnsEqual(newColumns, columns)) {
                        setColumns(newColumns);
                    }
                }
            }
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
        }
    }, [columns]);
    

    const startResize = useCallback((event, direction) => {
        event.preventDefault();
        document.documentElement.style.cursor = 'col-resize';
        const target = event.target;
        const index = parseInt(target.getAttribute('data-index'));
        const initialWidths = columns.filter(column => column.visible).map(column => column.width);

        const container = containerRef.current;
        const containerWidth = container.getBoundingClientRect().width;
        const minWidth = 200 / containerWidth * 100
        const maxWidth = 100;

        // Capture initial mouse position and current width of the target column.
        const initialMouseX = event.clientX;
        const initialWidth = initialWidths[index];

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - initialMouseX;
            const deltaPercent = (deltaX / containerWidth) * 100;

            let newWidth = direction === 'left' ? initialWidth - deltaPercent : initialWidth + deltaPercent;
            const newWidths = handleResize(initialWidths, index, newWidth, minWidth, maxWidth, direction);
            let newColumns = columns.filter(column => column.visible).map((column, i) => ({ ...column, width: newWidths[i] }));
            
            // Add the widths of the hidden columns to the visible ones
            const hiddenColumns = columns.filter(column => !column.visible).map(column => ({...column, width: 0 }));
            newColumns = newColumns.concat(hiddenColumns);
            setColumns(newColumns);
        };

        target.style.backgroundColor = 'rgba(0, 0, 0, 1)'; // Indicate resizing

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            target.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Reset color
            document.documentElement.style.cursor = ''; // Change cursor to grabbing
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    const toggleColumnVisibility = useCallback((columnId) => {
        // Resize the columns to fit the new layout
        let newColumns = columns.map(column => {
            if (column.id === columnId) {
                return { ...column, visible: !column.visible };
            }
            return column;
        });
        const totalWidth = newColumns.reduce((acc, column) => acc + (column.visible ? column.width : 0), 0);
        newColumns = newColumns.map(column => {
            if (!column.visible) return {...column, width: 0};
            else return { ...column, width: column.width / totalWidth * 100};
        });
        setColumns(newColumns);
    });

    const startReorder = useCallback((event, id) => {
        event.preventDefault();
        document.documentElement.style.cursor = 'grabbing';
        const column = columns.find(column => column.id === id);
        let columnsCopy = [...columns];
        let index = columnsCopy.indexOf(column);
        let auxColumns = [];
        columnsRef.current.forEach((col, i) => {
            if (col) {
                const initialX = col.getBoundingClientRect().left;
                const initialY = col.getBoundingClientRect().top;
                const columnWidth = col.getBoundingClientRect().width;
                const columnHeight = col.getBoundingClientRect().height;

                const auxColumn = col.cloneNode(true);
                auxColumn.className = 'column-dragging';
                auxColumn.style.left = `${initialX}px`;
                auxColumn.style.top = `${initialY}px`;
                auxColumn.style.width = `${columnWidth}px`;
                auxColumn.style.height = `${columnHeight}px`;
                auxColumn.style.pointerEvents = 'none';
                if (i !== index) {
                    auxColumn.style.transition = 'left 0.2s ease-in-out, opacity 0.2s ease-in-out';
                }
                col.parentNode.appendChild(auxColumn);
                auxColumns.push(auxColumn);
            }
        });
        const auxColumn = auxColumns[index];
        const initialX = auxColumn.getBoundingClientRect().left;
        const columnWidth = auxColumn.getBoundingClientRect().width;

        auxColumn.style.zIndex = 1000;
        auxColumn.style.top = `${auxColumn.getBoundingClientRect().top - 10}px`;
        auxColumn.style.setProperty('--box-shadow', '0.5em 0.9em 0.8em rgba(248, 50, 255, 0.14)');
        auxColumns.forEach((col, i) => {
            if (i !== index) {
                col.style.opacity = 0.5;
            }
        });

        // Make all the original columns invisible and disable pointer events, as weel as change their opacity for later animation
        columnsRef.current.forEach((col, i) => {
            if (col) {
                col.style.visibility = 'hidden';
                col.style.pointerEvents = 'none';
            }
        });

        const initialMouseX = event.clientX;
        const containerOffset = containerRef.current.getBoundingClientRect().left;
        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - initialMouseX;
            const newX = Math.min(Math.max(initialX + deltaX, containerRef.current.getBoundingClientRect().left), containerRef.current.getBoundingClientRect().right - columnWidth); // Ensure it doesn't go out of bounds
            auxColumn.style.left = `${newX}px`;

            // Check if reordering is needed
            const nextBoundingRect = auxColumns[index + 1] ? auxColumns[index + 1].getBoundingClientRect() : null;
            let nextMiddleX = 1000000000000;
            if (nextBoundingRect) {
                const realLeft = containerOffset + columnsCopy.slice(0, index+1).reduce((acc, col) => acc + (col.visible ? col.width : 0), 0) / 100 * containerRef.current.getBoundingClientRect().width;
                nextMiddleX = realLeft + nextBoundingRect.width / 2;
            }
            const prevBoundingRect = auxColumns[index - 1] ? auxColumns[index - 1].getBoundingClientRect() : null;
            let prevMiddleX = 0;
            if (prevBoundingRect) {
                const realLeft = containerOffset + columnsCopy.slice(0, index-1).reduce((acc, col) => acc + (col.visible ? col.width : 0), 0) / 100 * containerRef.current.getBoundingClientRect().width;
                prevMiddleX = realLeft + prevBoundingRect.width / 2;
            }
            let aux = 0;
            if (nextMiddleX <= newX + columnWidth) aux = 1; 
            if (prevMiddleX >= newX) aux = -1;

            // Reorder the columns in the array
            if (aux !== 0) {
                const movedColumn = auxColumns[index + aux];
                auxColumns[index + aux] = auxColumns[index];
                auxColumns[index] = movedColumn;
                if (aux > 0) {
                    const realLeft = containerOffset + columnsCopy.slice(0, index+1).reduce((acc, col) => acc + (col.visible ? col.width : 0), 0) / 100 * containerRef.current.getBoundingClientRect().width;
                    const newLeft = realLeft - columnWidth;
                    movedColumn.style.left = `${newLeft}px`;
                } else {
                    const realLeft = containerOffset + columnsCopy.slice(0, index-1).reduce((acc, col) => acc + (col.visible ? col.width : 0), 0) / 100 * containerRef.current.getBoundingClientRect().width;
                    const newLeft = realLeft + columnWidth;
                    movedColumn.style.left = `${newLeft}px`;
                }
                columnsCopy[index] = columnsCopy[index + aux];
                columnsCopy[index + aux] = column;
                index += aux;
            }
        };
        
        const onMouseUp = async () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.documentElement.style.cursor = '';
            auxColumn.style.transition = 'left 0.2s ease-in-out, top 0.2s ease-in-out';
            auxColumn.style.left = `${containerOffset + columnsCopy.slice(0, index).reduce((acc, col) => acc + (col.visible ? col.width : 0), 0) / 100 * containerRef.current.getBoundingClientRect().width}px`;
            auxColumn.style.top = `${containerRef.current.getBoundingClientRect().top}px`;
            auxColumn.style.setProperty('--box-shadow', '');
            auxColumns.forEach((col, i) => {
                if (i !== index) {
                    col.style.opacity = 1;
                }
            });
            const waitForAllTransitions = (elements) => {
                return Promise.all(
                    elements.map(element => new Promise(resolve => {
                        element.addEventListener('transitionend', resolve, { once: true });
                    }))
                );
            };
            await waitForAllTransitions(auxColumns);
            setColumns(columnsCopy);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); // Wait for 2 frames to ensure the transition is complete
            auxColumns.forEach((auxColumn) => {
                auxColumn.parentNode.removeChild(auxColumn);
            });
            columnsRef.current.forEach((col) => {
                if (col) {
                    col.style.visibility = 'visible';
                    col.style.pointerEvents = 'auto';
                }
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    })

    const columnsContent = {
        charts: 
            <>
                <Chart title="Voltage" dataKey="voltage" yUnits="V"/>
            </>,
        buttons:
            <>
                <WSButton command="precharge"/>
                <WSButton command="start levitation"/>
                <WSButton command="start motor"/>
                <WSButton command="stop motor"/>
                <WSButton command="stop levitation"/>
                <WSButton command="discharge"/>
            </>,
        console: 
            <>
                <Console/>
            </>,
    }

    return (
        <div className="columns-container-wrapper">
            <div className="columns-container" ref={containerRef}>
                {columns.filter(column => column.visible).map((column, index) => (
                    <div
                        key={column.id}
                        ref={el => columnsRef.current[index] = el}
                        className={`column-${column.visible ? 'visible' : 'hidden'}`}
                        style={{ width: `${column.width}%` }}
                    >
                        {index === 0 ?
                        (<div className="resize-handle-inactive"/>) 
                        : (
                            <div className="resize-handle" onMouseDown={(event) => startResize(event, 'left')} data-index={index}/>
                        )}
                        <Column id={column.id} onToggleVisibility={toggleColumnVisibility} onReorder={startReorder}>
                            {columnsContent[column.id]}
                        </Column>
                        {index === columns.filter(column => column.visible).length - 1 ? 
                        (<div className="resize-handle-inactive"/>) 
                        : (
                            <div className="resize-handle" onMouseDown={(event) => startResize(event, 'right')} data-index={index}/>
                        )}
                    </div>
                ))}
            </div>
            {columns.filter(column => !column.visible).length > 0 ? 
                <div className="columns-container-minimized">
                    {columns.filter(column => !column.visible).map((column, index) => (
                        <div key={column.id} className="column-hidden" onClick={() => toggleColumnVisibility(column.id)}>
                            {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                        </div>
                    ))}
                </div>
                : null
            }
        </div>
    );
}

function handleResize (widths, index, newWidth, minWidth, maxWidth, direction) {
	const newWidths = [...widths];

	newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

	// Accumulated width of the columns to the other side of the resized column
	let accumulatedWidth = 0;
	for (let i = (direction === 'left' ? index + 1 : 0); i < (direction === 'left' ? widths.length : index); i++) {
		accumulatedWidth += widths[i];
	}
	// Calculate the new width of the resized column
	if (newWidth + accumulatedWidth + (direction === 'left' ? index : widths.length - 1 - index) * minWidth > maxWidth) {
		newWidth = maxWidth - accumulatedWidth - (direction === 'left' ? index : widths.length - 1 - index) * minWidth;
	}
	newWidths[index] = newWidth;

	// Calculate the new widths of the other columns
	if (direction === 'left') {
		let leftWidth = maxWidth - newWidth - accumulatedWidth - index * minWidth;
		for (let i = 0; i < index; i++) {
			if (i === index - 1) {
				newWidths[i] = leftWidth + minWidth;
				leftWidth = 0;
				continue;
			}
			let aux = Math.min(leftWidth + minWidth, widths[i]);
			newWidths[i] = aux;
			leftWidth -= (aux-minWidth);
		}
	} else {
		let rightWidth = maxWidth - newWidth - accumulatedWidth - (widths.length - 1 - index) * minWidth;
		for (let i = widths.length - 1; i > index; i--) {
			if (i === index + 1) {
				newWidths[i] = rightWidth + minWidth;
				rightWidth = 0;
				continue;
			}
			let aux = Math.min(rightWidth + minWidth, widths[i]);
			newWidths[i] = aux;
			rightWidth -= (aux-minWidth);
		}
	}
	return newWidths;
}

export default ColumnsContainer;