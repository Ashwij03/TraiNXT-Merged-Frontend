import "./dashboard.css";

function PendingCommentsWidget({ comments = [] }) {
  return (
    <div className="dashboard-widget">
      <h3>Pending Comments</h3>

      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <strong>{comment.id}</strong>
          <div>{comment.subject}</div>
          <small>{comment.status}</small>
        </div>
      ))}
    </div>
  );
}

export default PendingCommentsWidget;
