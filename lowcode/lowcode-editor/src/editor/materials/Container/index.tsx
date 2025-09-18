import type {CommonComponentProps} from '../../interface';
import {
  useComponentsStore
} from '../../stores/components';
import {
  useComponentConfigStore
} from '../../stores/component-config';
import {useMaterialDrop} from '../../hooks/useMaterialDrop';

const Container = ({id,children,name}: CommonComponentProps) => {
  const {addComponent} = useComponentsStore();
  const {componentConfigs} = useComponentConfigStore();
  const {canDrop,drop} = useMaterialDrop(['Button','Container'],id);
  return (
    <div 
      ref={drop}
      className={`p-[20px] min-h-[100px] box-border border border-solid border-gray-300 bg-gray-50 ${canDrop ? 'border-dashed border-blue-400 bg-blue-50' : ''}`}
    >
      {children || <div className="text-gray-400 text-center">Container - 拖拽组件到这里</div>}
    </div>
  )
}

export default Container;