import { useState } from 'react';
import toast from 'react-hot-toast';

export const useBLEBroadcast = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [beaconName, setBeaconName] = useState('CLASSROOM_301');

  // Check if Web Bluetooth API is supported
  const isWebBluetoothSupported = () => {
    return navigator.bluetooth !== undefined;
  };

  // Start broadcasting BLE beacon
  const startBroadcasting = async (customBeaconName = 'CLASSROOM_301') => {
    try {
      setBeaconName(customBeaconName);

      // Store beacon information in localStorage to simulate broadcasting
      // In a real implementation, this would be a hardware beacon or native app
      const beaconData = {
        name: customBeaconName,
        isActive: true,
        timestamp: new Date().toISOString(),
        teacherId: 'current-teacher' // In real app, get from auth context
      };

      localStorage.setItem('activeBeacon', JSON.stringify(beaconData));
      setIsBroadcasting(true);

      toast.success(`BLE Beacon "${customBeaconName}" broadcasting started!`);

      return { success: true, beaconName: customBeaconName };

    } catch (error) {
      console.error('BLE broadcast error:', error);
      toast.error('Failed to start beacon broadcasting. Please try again.');
      return { error: error.message };
    }
  };

  // Stop broadcasting
  const stopBroadcasting = () => {
    setIsBroadcasting(false);
    localStorage.removeItem('activeBeacon');
    toast.success('BLE Beacon broadcasting stopped.');
  };

  // Update beacon name
  const updateBeaconName = (newName) => {
    setBeaconName(newName);
    if (isBroadcasting) {
      // If currently broadcasting, restart with new name
      stopBroadcasting();
      setTimeout(() => startBroadcasting(newName), 1000);
    }
  };

  return {
    isBroadcasting,
    beaconName,
    isWebBluetoothSupported,
    startBroadcasting,
    stopBroadcasting,
    updateBeaconName
  };
};
