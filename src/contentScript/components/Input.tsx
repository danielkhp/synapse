import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ value, onChange }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      placeholder="Type a command..."
      className="helm-command-input"
      value={value}
      onChange={onChange}
    />
  );
});

export default Input;
