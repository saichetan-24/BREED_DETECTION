import React, { useState } from 'react';

const e = React.createElement;

function BreedSelector({ breeds, onSelect, loading }) {
  const [selected, setSelected] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected) {
      onSelect(selected);
    }
  };

  return e(
    'form',
    { className: 'breed-selector-section', onSubmit: handleSubmit },
    e('div', { style: { marginBottom: 8 } }, 'Select correct breed:'),
    e(
      'select',
      {
        className: 'breed-dropdown',
        value: selected,
        onChange: (evt) => setSelected(evt.target.value),
        disabled: loading,
      },
      e('option', { value: '' }, '-- Select Breed --'),
      breeds.map((breed) => e('option', { key: breed, value: breed }, breed))
    ),
    e('br'),
    e(
      'button',
      {
        className: 'select-btn',
        type: 'submit',
        disabled: loading || !selected,
      },
      'Use Selected Breed'
    )
  );
}

export default BreedSelector;
