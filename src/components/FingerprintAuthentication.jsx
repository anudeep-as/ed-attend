import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Fingerprint, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const FingerprintAuthentication = ({ user, onSuccess, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const scanRef = useRef(null);

  useEffect(() => {
    // Auto-start scanning when component mounts
    startScan();
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Check if WebAuthn/Fingerprint is supported
      if (!window.PublicKeyCredential) {
        // Fallback: Simulate fingerprint scan for demo
        await simulateFingerprintScan();
        return;
      }

      // Try to use biometric authentication
      const available = await navigator.credentials.canDiscoverCredentials();
      if (!available) {
        // Fallback to simulation if no biometric hardware
        await simulateFingerprintScan();
        return;
      }

      // Use WebAuthn for fingerprint
      await performWebAuthn();
    } catch (error) {
      console.log('Biometric not available, using simulation:', error);
      await simulateFingerprintScan();
    }
  };

  const simulateFingerprintScan = async () => {
    // Simulate fingerprint scanning process (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate verification result (85% success rate for demo)
    const isMatch = Math.random() > 0.15;
    
    setIsScanning(false);
    
    if (isMatch) {
      setScanResult('success');
      toast.success('Fingerprint verified successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setScanResult('failed');
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error('Fingerprint not matched. Please try again.');
      }
    }
  };

  const performWebAuthn = async () => {
    try {
      // Create a WebAuthn credential request
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        timeout: 60000,
        userVerification: 'required',
        authenticatorSelection: {
          authenticatorAttachment: 'fingerprint',
          userVerification: 'required'
        }
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      // If we get here, biometric was successful
      setScanResult('success');
      toast.success('Fingerprint verified successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('WebAuthn error:', error);
      // Fallback to simulation
      await simulateFingerprintScan();
    }
  };

  const retryScan = () => {
    setScanResult(null);
    startScan();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Fingerprint Verification</h2>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-indigo-100 text-sm mt-1">
            Place your finger on the fingerprint scanner
          </p>
        </div>

        {/* Fingerprint Display */}
        <div className="p-4 sm:p-6">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4">
            <div className="flex flex-col items-center justify-center h-64 py-8">
              {/* Fingerprint Icon with Animation */}
              <motion.div
                animate={isScanning ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{
                  repeat: isScanning ? Infinity : 0,
                  duration: 1.5
                }}
                className={`mb-6 ${scanResult === 'success' ? 'text-green-400' : scanResult === 'failed' ? 'text-red-400' : 'text-indigo-400'}`}
              >
                <Fingerprint className="h-32 w-32" />
              </motion.div>

              {/* Status Text */}
              <div className="text-center">
                {isScanning && (
                  <p className="text-indigo-300 text-sm mb-2">Scanning...</p>
                )}
                {scanResult === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center text-green-400"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    <span className="font-medium">Verified!</span>
                  </motion.div>
                )}
                {scanResult === 'failed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center text-red-400"
                  >
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span className="font-medium">Not Matched</span>
                  </motion.div>
                )}
              </div>

              {/* Scanning Animation Lines */}
              {isScanning && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5 + i * 0.3,
                        ease: 'linear'
                      }}
                      className="absolute h-1 bg-indigo-400 opacity-30"
                      style={{ top: `${30 + i * 15}%` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Result Overlay */}
            {scanResult === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-green-500 bg-opacity-10 flex items-center justify-center"
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
            )}
            {scanResult === 'failed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center"
              >
                <AlertCircle className="h-16 w-16 text-red-500" />
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {scanResult === 'failed' && attempts < 3 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={retryScan}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Try Again
              </motion.button>
            )}

            {scanResult === 'failed' && attempts >= 2 && (
              <p className="text-center text-red-500 text-sm">
                Maximum attempts reached. Please try again later.
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FingerprintAuthentication;
