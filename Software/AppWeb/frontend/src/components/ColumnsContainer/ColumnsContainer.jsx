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
		const parent = target.parentNode;
		// Calculate index based on DOM structure (may consider using a data attribute for a more robust solution)
		const index = parseInt(event.target.id);
		const minWidth = 15; // Min width
		const maxWidth = 100; // Max width
		// Capture initial widths so that the resizing is relative to the starting values
		let initialWidths = columns.map(column => column.width);

		const onMouseMove = (moveEvent) => {
			let newWidth = 0;
			if (direction === 'left') {
				newWidth = parent.getBoundingClientRect().right - moveEvent.clientX;
			} else { 
				newWidth = moveEvent.clientX - parent.getBoundingClientRect().left;
			}
			newWidth = (newWidth / (window.innerWidth-6)) * 100; // Convert to percentage
			const newWidths = handleResize(initialWidths, index, newWidth, minWidth, maxWidth, direction);
			//initialWidths = newWidths; // Update initial widths for the next move event
			const newColumns = columns.map((column, i) => {
				return { ...column, width: newWidths[i]};
			});
			setColumns(newColumns);
		};

		target.style.backgroundColor = 'rgba(0, 0, 0, 1)'; // Change color to indicate resizing

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

    return (
        <div className="columns-container">
            {columns.map((column, index) => {
                const ColumnComponent = column.component;
                return (
                    <div key={column.id} id={column.id} className={`column-${column.visible ? 'visible' : 'hidden'}`} style={{ width: `${column.width}%` }}>
                        {index === 0 ? null : (<div className="resize-handle" onMouseDown={startResizeLeft} id={index}/>)}
                        <ColumnComponent />
                        {index === columns.length - 1 ? null : (<div className="resize-handle" onMouseDown={startResizeRight} id={index}/>)}
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