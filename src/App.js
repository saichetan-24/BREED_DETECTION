import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import PredictionResult from './components/PredictionResult';
import BreedSelector from './components/BreedSelector';
import './App.css';

const e = React.createElement;

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [changeMode, setChangeMode] = useState(false);
  const [breeds, setBreeds] = useState([]);
  const [finalBreed, setFinalBreed] = useState('');

  const handleImage = (file, url) => {
    setImage(file);
    setPreview(url);
    setPrediction(null);
    setFinalBreed('');
    setChangeMode(false);
    setWarning('');
    setSuccess('');
    setError('');
  };

  const resetFlow = () => {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setFinalBreed('');
    setChangeMode(false);
    setBreeds([]);
    setWarning('');
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please upload or capture an image.');
      return;
    }
    setLoading(true);
    setError('');
    setWarning('');
    setSuccess('');
    setPrediction(null);
    setFinalBreed('');
    setChangeMode(false);
    try {
      const formData = new FormData();
      formData.append('file', image);
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPrediction(data);
      setFinalBreed(data.prediction);
      if (data.confidence < 0.6) {
        setWarning('⚠️ Low confidence. Please verify manually.');
      }
    } catch (err) {
      setError(err.message || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/class_list');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBreeds(data.breeds || []);
      setChangeMode(true);
    } catch (err) {
      setError(err.message || 'Failed to load breed list.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!prediction || !finalBreed) {
      setError('Final breed is required before submission.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted: prediction.prediction,
          confirmed: finalBreed,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(`Final decision saved. Confirmed breed: ${finalBreed}`);
      setTimeout(() => {
        resetFlow();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return e(
    'div',
    { className: 'container' },
    e('h1', null, 'Cattle & Buffalo Breed Recognition System 🐄'),
    e(
      'div',
      { className: 'input-section' },
      e(ImageUpload, { onImage: handleImage, disabled: loading }),
      e('span', { style: { margin: '0 10px' } }, 'or'),
      e(CameraCapture, { onImage: handleImage, disabled: loading })
    ),
    preview
      ? e(
          'div',
          { className: 'preview-section' },
          e('img', { src: preview, alt: 'Preview', className: 'preview-img' })
        )
      : null,
    e(
      'button',
      { onClick: handlePredict, disabled: loading || !image, className: 'predict-btn' },
      loading ? 'Predicting...' : 'Predict Breed'
    ),
    loading
      ? e(
          'div',
          { className: 'loading-msg' },
          e('span', { className: 'spinner' }),
          e('span', { style: { marginLeft: '8px' } }, 'Loading...')
        )
      : null,
    error ? e('div', { className: 'error-msg' }, error) : null,
    warning ? e('div', { className: 'warning-msg' }, warning) : null,
    prediction && !changeMode
      ? e(PredictionResult, {
          prediction,
          onConfirm: () => setFinalBreed(prediction.prediction),
          onChange: handleChangeClick,
          loading,
        })
      : null,
    changeMode
      ? e(BreedSelector, {
          breeds,
          onSelect: (breed) => setFinalBreed(breed),
          loading,
        })
      : null,
    prediction
      ? e(
          'div',
          { className: 'final-decision-box' },
          e('div', null, 'Selected Final Breed: ', e('b', null, finalBreed || 'Not selected')),
          e(
            'button',
            {
              className: 'select-btn large-btn',
              onClick: handleFinalSubmit,
              disabled: loading || !finalBreed,
            },
            'Submit Final Decision'
          )
        )
      : null
    ,
    success ? e('div', { className: 'success-msg' }, success) : null
  );
}

export default App;
