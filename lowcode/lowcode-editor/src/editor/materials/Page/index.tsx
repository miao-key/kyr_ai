import type {CommonComponentProps} from '../../interface';
import {useDrop} from 'react-dnd';
import {useRef} from 'react';
import {useComponentsStore} from '../../stores/components';
import {
  useComponentConfigStore
} from '../../stores/component-config';

function Page({id,children}: CommonComponentProps) {
  const {addComponent} = useComponentsStore();
  const {componentConfigs} = useComponentConfigStore();
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ canDrop }, drop] = useDrop(()=>({
    // 允许释放的元素
    accept: ['Button','Container','Text','Input'],
    drop: (item: {type: string},monitor)=>{
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }
      console.log('Drop item:', item);
      console.log('Available componentConfigs:', componentConfigs);
      
      if (!componentConfigs[item.type]) {
        console.error('Component config not found for type:', item.type);
        return;
      }
      
      const props = componentConfigs[item.type].defaultProps;
      console.log('Adding component with props:', props);

      addComponent({
        id: new Date().getTime(),
        name: item.type,
        props
      }, id) // 将组件添加为 Page 组件（id=1）的子组件
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  }))

  // 连接 drop ref
  drop(ref);
  
  return (
    <div 
      ref={ref} 
      className={`p-[20px] h-[100%] box-border ${canDrop ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
    >
      {children}
    </div>
  )
}
export default Page;