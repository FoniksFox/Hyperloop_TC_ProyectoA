import './Column.css';
import ReorderIcon from '../../assets/move.svg?react';
import HideIcon from '../../assets/x.svg?react';

function Column({ onToggleVisibility, onReorder, id, className, header, children }) {
    if (!className) className = id;
    if (!header) header = id.charAt(0).toUpperCase() + id.slice(1);
    return (
        <div className={`column ${className}`}>
            <div className="column-header">
                <div className="column-header-managers">
                    <div className="reorder" onMouseDown={(event) => onReorder(event, id)}>
                        <ReorderIcon className="column-icon" />
                    </div>
                    <button className="toggle" onClick={() => onToggleVisibility(id)}>
                        <HideIcon className="column-icon" />
                    </button>
                </div>
                <h2 className="column-header-title">{header}</h2>
            </div>
            <div className="column-content">{children}</div>
        </div>
    );
}

export default Column;