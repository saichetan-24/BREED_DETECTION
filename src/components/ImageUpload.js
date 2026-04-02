import React, { useRef } from 'react';

const e = React.createElement;

function ImageUpload({ onImage, disabled }) {
  const fileInput = useRef();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImage(file, url);
    }
  };

  return e(
    'div',
    null,
    e('input', {
      type: 'file',
      accept: 'image/*',
      onChange: handleChange,
      ref: fileInput,
      disabled,
      style: { display: 'none' },
    }),
    e(
      'button',
      {
        onClick: () => fileInput.current && fileInput.current.click(),
        disabled,
        className: 'predict-btn',
        style: { background: '#2196f3', marginRight: 8 },
      },
      'Upload Image'
    )
  );
}

export default ImageUpload;
