import './ColumnsContainer.css';
import { useState } from 'react';

import ChartColumn from '../ChartColumn/ChartColumn.jsx';
import ButtonColumn from '../ButtonColumn/ButtonColumn.jsx';
import ConsoleColumn from '../ConsoleColumn/ConsoleColumn.jsx';

// Handle resizing, closing and opening of the columns (when minimized, they appear at the bottom of the screen as a bar)
function ColumnsContainer() {
    const [columns, setColumns] = useState([
        { id: 'charts', component: ChartColumn, visible: true, width: 33 },
        { id: 'buttons', component: ButtonColumn, visible: true, width: 34 },
        { id: 'console', component: ConsoleColumn, visible: true, width: 33 }
    ]);

    const startResize = (event, direction) => {
        event.preventDefault();
        const target = event.target;
        const columnElement = target.parentNode;
        // Use dataset for robust index retrieval
        const index = parseInt(target.getAttribute('data-index'));
        const minWidth = 15; // Min width (percentage)
        const maxWidth = 100; // Max width (percentage)
        // Capture initial widths so that the resizing is relative to the starting values
        const initialWidths = columns.filter(column => column.visible).map(column => column.width);

        // Get container element (assumes parent of a column is the container)
        const container = columnElement.parentNode;
        const containerRect = container.getBoundingClientRect();

        // Capture initial mouse position and the current width (as percentage) of the target column.
        const initialMouseX = event.clientX;
        const initialWidth = initialWidths[index];

        const onMouseMove = (moveEvent) => {
            // Calculate delta
            const deltaX = moveEvent.clientX - initialMouseX;
            const deltaPercent = (deltaX / containerRect.width) * 100;

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
        <div className="columns-container">
            {columns.filter(column => column.visible).map((column, index) => {
                const ColumnComponent = column.component;
                return (
                    <div key={column.id} className={`column-${column.visible ? 'visible' : 'hidden'}`} style={{ width: `${column.width}%` }}>
                        {index === 0 ? null : (
                            <div className="resize-handle" onMouseDown={startResizeLeft} data-index={index}/>
                        )}
                        <ColumnComponent />
                        {index === columns.length - 1 ? null : (
                            <div className="resize-handle" onMouseDown={startResizeRight} data-index={index}/>
                        )}
                    </div>
                );
            })}
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