import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

function ScanAnimal() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cameraStarted, setCameraStarted] = useState(false);
  const [starting, setStarting] = useState(false);

  const lookupAnimal = async (code) => {
    try {
      const response = await api.get(`/animals/qrcode/${code}`);
      navigate(`/caretaker/${response.data.animal._id}`);
    } catch (err) {
      alert('No animal found for this QR code.');
    }
  };

  // Camera only starts when the user explicitly taps the button —
  // required by most mobile browsers' autoplay/camera permission policies.
  const startCamera = async () => {
    setStarting(true);
    setCameraError('');

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader');
    }

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
            return { width: size, height: size };
          },
        },
        async (decodedText) => {
          isRunningRef.current = false;
          await scannerRef.current.stop().catch(() => {});
          lookupAnimal(decodedText);
        },
        () => {}
      );
      isRunningRef.current = true;
      setCameraStarted(true);
    } catch (err) {
      console.error('Camera start failed:', err);
      isRunningRef.current = false;
      setCameraError('Could not access the camera. Please allow camera permission, or enter the code manually below.');
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (isRunningRef.current) {
        scannerRef.current?.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold text-vantaraGreen mb-4">📷 Scan Animal QR Code</h1>

      {!cameraStarted && (
        <button
          onClick={startCamera}
          disabled={starting}
          className="mb-4 bg-vantaraGreen text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {starting ? 'Starting camera...' : '📷 Tap to Start Camera'}
        </button>
      )}

      <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow"></div>

      {cameraError && (
        <div className="mt-4 w-full max-w-sm bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3 rounded-lg">
          {cameraError}
        </div>
      )}

      {cameraStarted && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Point your camera at the animal's QR tag to open its daily checklist.
        </p>
      )}

      <div className="w-full max-w-sm mt-6 bg-white rounded-xl shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Or enter QR code manually:</p>
        <div className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="VANTARA-XXXXXXXX"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vantaraGold"
          />
          <button
            onClick={() => lookupAnimal(manualCode)}
            className="bg-vantaraGreen text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScanAnimal;