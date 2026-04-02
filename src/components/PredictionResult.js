import React from 'react';

const e = React.createElement;

function PredictionResult({ prediction, onConfirm, onChange, loading }) {
  return e(
    'div',
    { className: 'prediction-section' },
    e('div', { className: 'prediction-label' }, `AI Suggested Breed: ${prediction.prediction}`),
    e('div', { className: 'confidence' }, `Confidence: ${(prediction.confidence * 100).toFixed(1)}%`),
    e(
      'ul',
      { className: 'top3-list' },
      prediction.top3.map((item, idx) =>
        e('li', { key: item.label }, `${idx + 1}. ${item.label} — ${(item.confidence * 100).toFixed(2)}%`)
      )
    ),
    e(
      'div',
      { className: 'action-btns' },
      e(
        'button',
        {
          className: 'confirm-btn',
          onClick: onConfirm,
          disabled: loading,
        },
        '✅ Confirm Breed'
      ),
      e(
        'button',
        {
          className: 'change-btn',
          onClick: onChange,
          disabled: loading,
        },
        '🔄 Change Breed'
      )
    )
  );
}

export default PredictionResult;
