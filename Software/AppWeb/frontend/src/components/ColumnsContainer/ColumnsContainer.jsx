import './ColumnsContainer.css';
import { useState, useRef, useEffect, useCallback } from 'react';

import Column from '../Column/Column.jsx';

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
        const target = event.target;
        const index = parseInt(target.getAttribute('data-index'));
        // Capture initial widths so that the resizing is relative to the starting values
        const initialWidths = columns.filter(column => column.visible).map(column => column.width);

        // Get container element (assumes parent of a column is the container)
        const container = containerRef.current;
        const containerWidth = container.getBoundingClientRect().width - parseFloat(window.getComputedStyle(container).paddingLeft) - parseFloat(window.getComputedStyle(container).paddingRight);
        const minWidth = 200 / containerWidth * 100; // Minimum width (percentage) based on the container's width
        const maxWidth = 100; // Max width (percentage)

        // Capture initial mouse position and the current width (as percentage) of the target column.
        const initialMouseX = event.clientX;
        const initialWidth = initialWidths[index];

        const onMouseMove = (moveEvent) => {
            // Calculate delta
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
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

	const startResizeLeft = useCallback((event) => {
		startResize(event, 'left');
	});
	const startResizeRight = useCallback((event) => {
		startResize(event, 'right');
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
                        {index === 0 ? null : (
                            <div className="resize-handle" onMouseDown={startResizeLeft} data-index={index}/>
                        )}
                        <Column id={column.id} onToggleVisibility={toggleColumnVisibility}>
                        </Column>
                        {index === columns.filter(column => column.visible).length - 1 ? null : (
                            <div className="resize-handle" onMouseDown={startResizeRight} data-index={index}/>
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