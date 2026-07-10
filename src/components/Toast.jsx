function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-4 w-80 animate-pulse-once"
        >
          <p className="text-xs font-bold text-red-600 uppercase">🚨 New AI Alert</p>
          <p className="text-sm font-semibold text-gray-800 mt-1">
            {t.animalId?.name} ({t.animalId?.species})
          </p>
          <p className="text-xs text-gray-600 mt-1">{t.possibleConcern}</p>
        </div>
      ))}
    </div>
  );
}

export default Toast;