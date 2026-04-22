'use client';

// pages/index.js
import { useState, useRef, useCallback, useEffect } from 'react';

export default function FaceDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detection, setDetection] = useState(null);
  const [error, setError] = useState('');
  const [instruction, setInstruction] = useState('Click "Start Camera" to begin');
  const [targetDirection, setTargetDirection] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [countdown, setCountdown] = useState(null);
  const [isVisible, setVisible] = useState(true)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
        startDetection();
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setDetection(null);
    setInstruction('Camera stopped');
    setTargetDirection(null);
    setVerificationStatus('pending');
    setCountdown(null);
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const sendFrameToBackend = useCallback(async (frameData) => {
    try {
      const response = await fetch('http://localhost:5000/detect-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: frameData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Backend request failed:', err);
      return null;
    }
  }, []);

  const generateRandomDirection = () => {
    const directions = ['left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const startVerificationChallenge = () => {
    const direction = generateRandomDirection();
    setTargetDirection(direction);
    setVerificationStatus('active');
    setInstruction(`Please tilt your head to the ${direction}`);
    
    // Start 5-second countdown
    let count = 5;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        setVerificationStatus('failed');
        setInstruction('Verification failed - try again');
        setTimeout(() => {
          if (isStreaming) {
            startVerificationChallenge();
          }
        }, 2000);
      }
    }, 1000);
  };

  const checkVerification = useCallback((detectionResult) => {
    if (!targetDirection || verificationStatus !== 'active' || !detectionResult.face_detected) {
      return;
    }

    const { head_direction, tilt_angle } = detectionResult;
    
    const isCorrectDirection = head_direction === targetDirection;
    const isSufficientTilt = Math.abs(tilt_angle) > 15; 
    
    if (isCorrectDirection && isSufficientTilt) {
      setVerificationStatus('success');
      setInstruction('✅ Verification successful!');
      setCountdown(null);
      setVisible(false)
      stopCamera()
      setTimeout(() => {
        if (isStreaming) {
          startVerificationChallenge();
        }
      }, 2000);
    }
  }, [targetDirection, verificationStatus, isStreaming]);

  const startDetection = useCallback(() => {
    if (!isStreaming) return;

    const detectLoop = async () => {
      const frameData = captureFrame();
      if (frameData) {
        const result = await sendFrameToBackend(frameData);
        if (result) {
          setDetection(result);
          
          if (result.face_detected) {
            if (!targetDirection && verificationStatus === 'pending') {
              // Start first challenge
              setTimeout(() => startVerificationChallenge(), 1000);
            } else {
              checkVerification(result);
            }
          } else if (targetDirection) {
            setInstruction('Face not detected - please stay in frame');
          }
        }
      }

      if (isStreaming) {
        requestAnimationFrame(detectLoop);
      }
    };

    detectLoop();
  }, [isStreaming, captureFrame, sendFrameToBackend, targetDirection, verificationStatus, checkVerification]);

  useEffect(() => {
    if (isStreaming) {
      startDetection();
    }
  }, [isStreaming, startDetection]);

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success': return '#10B981';
      case 'failed': return '#EF4444';
      case 'active': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#2D3748',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: 'bold'
        }}>
          Face Detection & Head Tilt Verification
        </h1>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {!isStreaming ? (
            <button 
              onClick={startCamera}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                cursor: 'pointer',
                marginRight: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              Start Camera
            </button>
          ) : (
            <button 
              onClick={stopCamera}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              Stop Camera
            </button>
          )}
        </div>

 { isVisible &&         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: getStatusColor(),
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {instruction}
            {countdown && ` (${countdown}s)`}
          </div>
        </div>
}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              transform: 'scaleX(-1)' // Mirror the video
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {detection && (
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid #E2E8F0'
          }}>
            <h3 style={{ color: '#2D3748', marginBottom: '15px' }}>Detection Results:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Face Detected:</strong> 
                <span style={{ color: detection.face_detected ? '#10B981' : '#EF4444', marginLeft: '5px' }}>
                  {detection.face_detected ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <strong>Head Direction:</strong> 
                <span style={{ marginLeft: '5px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {detection.head_direction}
                </span>
              </div>
              <div>
                <strong>Tilt Angle:</strong> 
                <span style={{ marginLeft: '5px' }}>
                  {detection.tilt_angle}°
                </span>
              </div>
              <div>
                <strong>Confidence:</strong> 
                <span style={{ marginLeft: '5px' }}>
                  {(detection.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#EBF8FF',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#2B6CB0'
        }}>
          <strong>Instructions:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Make sure your face is clearly visible in the camera</li>
            <li>Follow the head tilt instructions when they appear</li>
            <li>Tilt your head sufficiently (at least 15 degrees) in the requested direction</li>
            <li>Complete the verification within the countdown timer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}