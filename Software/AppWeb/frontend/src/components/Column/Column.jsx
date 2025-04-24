import './Column.css';

function Column({ onToggleVisibility, onReorder, id, className, header, children }) {
    if (!className) className = id;
    if (!header) header = id.charAt(0).toUpperCase() + id.slice(1);
    return (
        <div className={`column ${className}`}>
            <div className="column-header">{header}</div>
            <button className="toggle-button" onClick={() => onToggleVisibility(id)}>Toggle Visibility</button>
            <div className="reorder" onMouseDown={(event) => onReorder(event, id)}>Reorder</div>
            <div className="column-content">{children}</div>
        </div>
    );
}

export default Column;