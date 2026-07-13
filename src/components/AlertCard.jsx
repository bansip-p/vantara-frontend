import { hasRole } from '../utils/roleHelpers';

const typeIcon = {
    'Health Prediction': '💓',
    'Behavior': '👁️',
    'Medicine Overdue': '💊',
    'Checkup Overdue': '📅',
    'Diet': '🥗',
    'Medical': '🩺',
  };

function AlertCard({ alert, onAcknowledge }) {
  const severityStyles = {
    Info: 'border-blue-300 bg-blue-50',
    Warning: 'border-yellow-400 bg-yellow-50',
    Critical: 'border-red-400 bg-red-50',
  };

  const severityText = {
    Info: 'text-blue-700',
    Warning: 'text-yellow-700',
    Critical: 'text-red-700',
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${severityStyles[alert.severity]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-bold uppercase ${severityText[alert.severity]}`}>
            {alert.severity} · {typeIcon[alert.alertType] || ''} {alert.alertType}
          </p>
          <p className="font-semibold text-gray-800 mt-1">
            {alert.animalId?.name} <span className="text-gray-400 font-normal">({alert.animalId?.species})</span>
          </p>
        </div>
        <span className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</span>
      </div>

      <p className="text-sm text-gray-600 mt-2">
        <span className="font-medium">Observation:</span> {alert.observation}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Possible Concern:</span> {alert.possibleConcern}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Recommended Action:</span> {alert.recommendedAction}
      </p>

      {alert.status === 'Open' && hasRole('SuperAdmin', 'Veterinarian') && (
        <button
          onClick={() => onAcknowledge(alert._id)}
          className="mt-3 text-xs bg-vantaraGreen text-white px-3 py-1.5 rounded-lg hover:opacity-90"
        >
          Acknowledge
        </button>
      )}
      {alert.status !== 'Open' && (
        <span className="mt-3 inline-block text-xs text-gray-500 italic">
          {alert.status === 'Acknowledged' ? '✓ Acknowledged' : '✅ Resolved'}
        </span>
      )}
    </div>
  );
}

export default AlertCard;