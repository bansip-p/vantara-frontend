import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../services/api';

function ScanAnimal() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false); // tracks whether the camera actually started
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');

  const lookupAnimal = async (code) => {
    try {
      const response = await api.get(`/animals/qrcode/${code}`);
      navigate(`/caretaker/${response.data.animal._id}`);
    } catch (err) {
      alert('No animal found for this QR code.');
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          isRunningRef.current = false;
          await scanner.stop().catch(() => {});
          lookupAnimal(decodedText);
        },
        () => {}
      )
      .then(() => {
        isRunningRef.current = true; // camera started successfully
      })
      .catch((err) => {
        console.error('Camera start failed:', err);
        isRunningRef.current = false;
        setCameraError('No camera detected on this device. You can enter the QR code manually below.');
      });

    return () => {
      // Only try to stop if it actually started — this prevents the crash
      if (isRunningRef.current) {
        scannerRef.current?.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold text-vantaraGreen mb-4">📷 Scan Animal QR Code</h1>

      <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow"></div>

      {cameraError && (
        <div className="mt-4 w-full max-w-sm bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm p-3 rounded-lg">
          {cameraError}
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4 text-center">
        Point your camera at the animal's QR tag to open its daily checklist.
      </p>

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