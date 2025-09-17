import {
    useEffect
} from 'react';
import {
    useComponentsStore
} from '../../../stores/components';

export function EditArea() {
    const { components, addComponent,deleteComponent } = useComponentsStore();
    
    useEffect(() => {
        // 检查是否已经初始化过组件
        const hasInitialized = components.some(comp => 
            comp.id === 222 || 
            (comp.children && comp.children.some(child => child.id === 222))
        );
        
        if (!hasInitialized) {
            // 只有在没有初始化时才添加组件
            addComponent({
                id: 222,
                name: 'Container',
                props: {},
                children: []
            }, 1);
            
            // 延迟添加子组件，确保父组件已经存在
            setTimeout(() => {
                addComponent({
                    id: 333,
                    name: 'Video',
                    props: {},
                    children: []
                }, 222);
            }, 0);
        }
        setTimeout(() =>{
            deleteComponent(333);
        },3000)
    }, [addComponent])  
    return (
        <div>
            <pre>
                {JSON.stringify(components, null, 2)}
            </pre>
        </div>
    )
}