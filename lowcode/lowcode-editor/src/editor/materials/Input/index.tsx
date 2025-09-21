import { Input as AntdInput } from 'antd';
import { forwardRef } from 'react';
import type { InputRef } from 'antd';
import type { CommonComponentProps } from '../../interface';

export interface InputProps extends Omit<CommonComponentProps, 'children'> {
  placeholder: string;
  disabled: boolean;
  size: 'large' | 'middle' | 'small';
  type: 'text' | 'password' | 'email' | 'number';
}

const Input = forwardRef<InputRef, InputProps>(({ 
  placeholder, 
  disabled, 
  size, 
  type, 
  id, 
  name, 
  children,  // 明确解构 children 但不使用
  ...props 
}, ref) => {
  return (
    <AntdInput 
      ref={ref}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      type={type}
      {...props}
    />
  )
})

Input.displayName = 'Input';

export default Input;
