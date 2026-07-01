import "./VersionHistoryModal.css";

export default function VersionHistoryModal({
    open,
    document,
    onClose
}) {

    if (!open || !document) return null;

    const history = document.history || [
        {
            version: "1.0",
            date: "15-Jan-2026",
            user: "Ramya"
        },
        {
            version: "1.1",
            date: "18-Feb-2026",
            user: "Varsha"
        },
        {
            version: document.version,
            date: document.modifiedDate,
            user: document.uploadedBy
        }
    ];

    return (
        <div className="history-overlay">

            <div className="history-modal">

                <div className="history-header">

                    <h3>Version History</h3>

                    <button onClick={onClose}>
                        ✕
                    </button>

                </div>

                <table className="history-table">

                    <thead>

                        <tr>

                            <th>Version</th>

                            <th>Date</th>

                            <th>User</th>

                        </tr>

                    </thead>

                    <tbody>

                        {history.map((item,index)=>(
                            <tr key={index}>

                                <td>{item.version}</td>

                                <td>{item.date}</td>

                                <td>{item.user}</td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );

}