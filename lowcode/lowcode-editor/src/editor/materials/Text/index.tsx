import { Typography, Input } from 'antd';
import { forwardRef, useState, useCallback, useEffect } from 'react';
import type { CommonComponentProps } from '../../interface';
import { useComponentsStore } from '../../stores/components';

const { Text: AntdText } = Typography;

export interface TextProps extends Omit<CommonComponentProps, 'children'> {
  content: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

const Text = forwardRef<HTMLSpanElement, TextProps>(({ 
  content, 
  fontSize, 
  color, 
  bold, 
  italic, 
  id, 
  name, 
  children, // 明确解构 children 但不使用
  ...props 
}, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const { updateComponentProps } = useComponentsStore();

  // 当 content 属性变化时，更新本地编辑值
  useEffect(() => {
    setEditValue(content);
  }, [content]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(content);
  }, [content]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    // 更新组件的 content 属性
    if (editValue !== content && id) {
      updateComponentProps(id, { content: editValue });
    }
  }, [editValue, content, id, updateComponentProps]);

  const handleInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  }, [handleInputBlur]);

  const textStyle = {
    fontSize: `${fontSize}px`,
    color: color,
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyPress={handleInputKeyPress}
        style={textStyle}
        autoFocus
        {...props}
      />
    );
  }

  return (
    <AntdText 
      ref={ref}
      style={{
        ...textStyle,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onDoubleClick={handleDoubleClick}
      title="双击编辑文本"
      {...props}
    >
      {content}
    </AntdText>
  )
})

Text.displayName = 'Text';

export default Text;
