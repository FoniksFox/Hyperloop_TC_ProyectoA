import './ColumnsContainer.css';
import { useState, useRef, useEffect } from 'react';

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
                    const newWidths = columns.map((column, index) => {
                        if (column.visible) {
                            const columnElement = columnsRef.current[index];
                            const width = columnElement.getBoundingClientRect().width;
                            return (width / containerWidth) * 100; // Convert to percentage
                        } else {
                            return 0;
                        }
                    });
                    setColumns(prevColumns => prevColumns.map((column, index) => ({ ...column, width: newWidths[index] })));
                }
            }
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
        }
    }, []);
    

    const startResize = (event, direction) => {
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
    };

	const startResizeLeft = (event) => {
		startResize(event, 'left');
	}
	const startResizeRight = (event) => {
		startResize(event, 'right');
	}

    const toggleColumnVisibility = (columnId) => {
        // Resize the columns to fit the new layout
        let newColumns = columns.map(column => {
            if (column.id === columnId) {
                return { ...column, visible: !column.visible };
            }
            return column;
        });
        const totalWidth = newColumns.reduce((acc, column) => acc + (column.visible ? column.width : 0), 0);
        newColumns = newColumns.map(column => {
            if (column.id === columnId) {
                return { ...column, width: 0 };
            }
            return { ...column, width: column.width / totalWidth * 100};
        });
        setColumns(newColumns);
    }

    return (
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