import { useDrag } from 'react-dnd';
export interface MaterialItemProps {
  name: string;
}

export function MaterialItem(props: MaterialItemProps) {
  const { name } = props;
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
  return <div
            ref={drag}
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