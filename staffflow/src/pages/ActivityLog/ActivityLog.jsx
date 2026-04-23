import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';

export default function ActivityLog() {
  const { activityLogs } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faoliyat jurnali</h1>
        <p className="text-gray-500 text-sm mt-1">Tizimda amalga oshirilgan barcha amallar</p>
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {activityLogs.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Hozircha faoliyat yo'q</p>
          ) : activityLogs.map(log => (
            <div key={log.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-lg shrink-0">
                {log.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{log.user}</span>
                  {' · '}
                  <span>{log.action}</span>
                  {log.target && (
                    <span className="text-indigo-600 font-medium"> "{log.target}"</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
