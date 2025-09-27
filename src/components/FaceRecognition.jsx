import { motion } from 'framer-motion';
import { AlertCircle, Camera, CheckCircle, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const FaceRecognition = ({ user, location, onSuccess, onCancel }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    setIsCapturing(false);

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const verifyFace = async () => {
    if (!capturedImage) return;

    setIsVerifying(true);
    
    try {
      // Simulate face verification process
      // In a real implementation, you would:
      // 1. Upload captured image to Supabase storage
      // 2. Compare with stored profile image using face recognition API
      // 3. Return similarity score
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate verification result (80% success rate for demo)
      const isMatch = Math.random() > 0.2;
      
      if (isMatch) {
        setVerificationResult('success');
        toast.success('Face verification successful!');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setVerificationResult('failed');
        toast.error('Face verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
      setVerificationResult('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setIsCapturing(true);
    startCamera();
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Face Verification</h2>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-emerald-100 text-sm mt-1">
            Position your face in the camera frame
          </p>
        </div>

        {/* Camera/Image Display */}
        <div className="p-4 sm:p-6">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-4 border-emerald-400 border-dashed rounded-xl opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-40 border-2 border-emerald-400 rounded-full opacity-60"></div>
                </div>
              </>
            ) : (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-64 object-cover"
                />
                {verificationResult === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </motion.div>
                )}
                {verificationResult === 'failed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center"
                  >
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={captureImage}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                Capture Photo
              </motion.button>
            ) : (
              <div className="space-y-3">
                {!verificationResult && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={verifyFace}
                    disabled={isVerifying}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verify Face
                      </>
                    )}
                  </motion.button>
                )}
                
                {verificationResult === 'failed' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={retakePhoto}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Retake Photo
                  </motion.button>
                )}
              </div>
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

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
};

export default FaceRecognition;