import './Column.css';

function Column({ onToggleVisibility, onReorder, id, className, header, children }) {
    if (!className) className = id;
    if (!header) header = id.charAt(0).toUpperCase() + id.slice(1);
    return (
        <div className={`column ${className}`}>
            <div className="column-header">
                <div className="column-header-managers">
                    <div className="reorder" onMouseDown={(event) => onReorder(event, id)}>Reorder</div>
                    <button className="toggle" onClick={() => onToggleVisibility(id)}>Hide</button>
                </div>
                <h2 className="column-header-title">{header}</h2>
            </div>
            <div className="column-content">{children}</div>
        </div>
    );
}

export default Column;