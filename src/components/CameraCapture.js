import React, { useEffect, useRef, useState } from 'react';

const e = React.createElement;

function CameraCapture({ onImage, disabled }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setCameraReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err) {
      let msg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') {
        msg += 'Camera permission denied. Please allow access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        msg += 'No camera device found.';
      } else {
        msg += err.message;
      }
      setCameraError(msg);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.srcObject) {
      setCameraError('No camera stream available.');
      return;
    }
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Waiting for camera to load... Please try again in a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        const url = URL.createObjectURL(file);
        onImage(file, url);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const videoEl = videoRef.current;
    videoEl.srcObject = stream;
    videoEl.onloadedmetadata = () => {
      videoEl.play().catch((err) => {
        setCameraError('Failed to play video stream: ' + err.message);
      });
    };
    videoEl.onplaying = () => {
      setTimeout(() => setCameraReady(true), 500);
    };

    return () => {
      videoEl.onloadedmetadata = null;
      videoEl.onplaying = null;
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return e(
    'div',
    { className: 'camera-container' },
    !stream
      ? e(
          'button',
          {
            onClick: startCamera,
            disabled,
            className: 'predict-btn',
            style: { background: '#ff9800' },
          },
          'Capture from Camera'
        )
      : null,
    stream
      ? e('video', {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          className: 'camera-video',
        })
      : null,
    stream
      ? e(
          'div',
          { className: 'camera-actions' },
          e(
            'button',
            {
              onClick: capturePhoto,
              disabled: disabled || !cameraReady,
              className: 'predict-btn',
              style: { background: '#ff9800', marginRight: 8 },
            },
            cameraReady ? 'Take Photo' : 'Camera Loading...'
          ),
          e(
            'button',
            {
              onClick: stopCamera,
              className: 'predict-btn',
              style: { background: '#666' },
            },
            'Close Camera'
          )
        )
      : null,
    cameraError ? e('div', { className: 'error-msg' }, cameraError) : null
  );
}

export default CameraCapture;
