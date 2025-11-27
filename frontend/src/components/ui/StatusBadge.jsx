export default function StatusBadge({ status }) {
  const statusConfig = {
    'Delivered': {
      color: 'bg-status-delivered',
      dot: 'bg-status-delivered',
    },
    'Out for Delivery': {
      color: 'bg-status-out-for-delivery',
      dot: 'bg-status-out-for-delivery',
    },
    'Processing': {
      color: 'bg-status-processing',
      dot: 'bg-status-processing',
    },
  };

  const config = statusConfig[status] || statusConfig['Processing'];

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      <span className="text-sm text-text-dark">{status}</span>
    </div>
  );
}

