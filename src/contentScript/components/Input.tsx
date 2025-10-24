import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      placeholder="Type a command..."
      className="helm-command-input"
      {...props}
    />
  );
});

export default Input;
