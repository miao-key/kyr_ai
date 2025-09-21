import { Button as AntdButton } from 'antd';
import { forwardRef } from 'react';
import type { ButtonType } from 'antd/es/button';
import type { CommonComponentProps } from '../../interface';

export interface ButtonProps extends Omit<CommonComponentProps, 'children'> {
  type: ButtonType;
  text: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ type, text, id, name, ...props }, ref) => {
  return (
    <AntdButton ref={ref} type={type} {...props}>
      {text}
    </AntdButton>
  )
})

Button.displayName = 'Button';

export default Button;