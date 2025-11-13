import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const OfflineIndicator = ({ onSync }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored! You are back online.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setSyncing(true);
    try {
      if (onSync) {
        await onSync();
      }
      toast.success('Data synced successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline) {
    return (
      <button
        onClick={handleSync}
        disabled={syncing}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        title="Sync data"
      >
        {syncing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5" />
            <span>Online - Click to Sync</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
      <WifiOff className="h-5 w-5" />
      <span>Offline Mode</span>
    </div>
  );
};

export default OfflineIndicator;
