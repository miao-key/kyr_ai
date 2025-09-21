import { useDrag } from 'react-dnd';
import { useRef } from 'react';

export interface MaterialItemProps {
  name: string;
}

export function MaterialItem(props: MaterialItemProps) {
  const { name } = props;
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: name,
    // 数据项
    item: {
      type: name
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // 连接 drag ref
  drag(ref);
  
  return <div
            ref={ref}
            className={`
              border-dashed
              border-[1px]
              border-[#000]
              py-[8px] px-[10px]
              m-[10px]
              cursor-move
              inline-block
              bg-white
              hover:bg-[#ccc]
              ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
          >
            {name}
          </div>
}