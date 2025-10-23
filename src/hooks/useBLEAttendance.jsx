import { useState } from 'react';
import toast from 'react-hot-toast';

export const useBLEAttendance = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [beaconFound, setBeaconFound] = useState(null);

  // Check if Web Bluetooth API is supported
  const isWebBluetoothSupported = () => {
    return navigator.bluetooth !== undefined;
  };

  // Scan for BLE beacons
  const scanForBeacon = async (beaconName = 'CLASSROOM_301', rssiThreshold = -70) => {
    try {
      setIsScanning(true);
      setBeaconFound(null);

      // First try Web Bluetooth API if supported
      if (isWebBluetoothSupported()) {
        try {
          // Request device with specific name
          const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: beaconName }],
            optionalServices: ['battery_service']
          });

          // Connect to device to get RSSI
          const server = await device.gatt.connect();
          const rssi = device.rssi || 0;

          if (rssi > rssiThreshold || rssi === 0) {
            setBeaconFound({
              name: device.name,
              id: device.id,
              rssi: rssi
            });

            toast.success(`Beacon "${beaconName}" detected! Signal strength: ${rssi}`);
            server.disconnect();

            return {
              success: true,
              beacon: {
                name: device.name,
                id: device.id,
                rssi: rssi
              }
            };
          } else {
            toast.error('Beacon detected but signal too weak. Please move closer.');
            server.disconnect();
            return { error: 'Signal too weak' };
          }
        } catch (bluetoothError) {
          console.log('Web Bluetooth failed, trying localStorage simulation:', bluetoothError);
        }
      }

      // Fallback: Check localStorage for simulated beacon
      const activeBeacon = localStorage.getItem('activeBeacon');
      if (activeBeacon) {
        const beaconData = JSON.parse(activeBeacon);

        if (beaconData.name === beaconName && beaconData.isActive) {
          // Simulate proximity check (in real app, this would be based on actual distance)
          const simulatedRSSI = -45; // Simulate strong signal

          if (simulatedRSSI > rssiThreshold) {
            setBeaconFound({
              name: beaconData.name,
              id: `simulated-${beaconData.name}`,
              rssi: simulatedRSSI
            });

            toast.success(`Beacon "${beaconName}" detected! Signal strength: ${simulatedRSSI}`);

            return {
              success: true,
              beacon: {
                name: beaconData.name,
                id: `simulated-${beaconData.name}`,
                rssi: simulatedRSSI
              }
            };
          } else {
            toast.error('Beacon detected but signal too weak. Please move closer.');
            return { error: 'Signal too weak' };
          }
        }
      }

      // No beacon found
      toast.error('No beacon found. Make sure the beacon is active and nearby.');
      return { error: 'No beacon found' };

    } catch (error) {
      console.error('BLE scan error:', error);

      if (error.name === 'NotAllowedError') {
        toast.error('Bluetooth permission denied. Please allow access to continue.');
      } else {
        toast.error('Failed to scan for beacon. Please try again.');
      }

      return { error: error.message };
    } finally {
      setIsScanning(false);
    }
  };

  // Stop scanning (if needed)
  const stopScan = () => {
    setIsScanning(false);
    setBeaconFound(null);
  };

  return {
    isScanning,
    beaconFound,
    isWebBluetoothSupported,
    scanForBeacon,
    stopScan
  };
};
