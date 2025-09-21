import React from 'react';
import {
    type Component,
    useComponentsStore
} from '../../stores/components';
import { useComponentConfigStore } from '../../stores/component-config';

export function EditArea() {
    const { components } = useComponentsStore();
    const { componentConfigs } = useComponentConfigStore();
    
    // useEffect(() => {
    //     // 检查是否已经初始化过组件
    //     const hasInitialized = components.some(comp => 
    //         comp.id === 222 || 
    //         (comp.children && comp.children.some(child => child.id === 222))
    //     );
        
    //     if (!hasInitialized) {
    //         // 只有在没有初始化时才添加组件
    //         addComponent({
    //             id: 222,
    //             name: 'Container',
    //             props: {},
    //             children: []
    //         }, 1);
            
    //         // 延迟添加子组件，确保父组件已经存在
    //         setTimeout(() => {
    //             addComponent({
    //                 id: 333,
    //                 name: 'Button',
    //                 props: {},
    //                 children: []
    //             }, 222);
    //         }, 0);
    //     }
    //     // setTimeout(() =>{
    //     //     deleteComponent(333);
    //     // },3000)
    // }, [addComponent])  

    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component) => {
           const config = componentConfigs?.[component.name];
           if (!config?.component) {
            return null;
           }
           return React.createElement(
            config.component,
            {
                key: component.id,
                id: component.id, // 传递组件的 id
                ...config.defaultProps,
                ...component.props,
            },
            renderComponents(component.children || [])
        )
        })
    }

    return (
        <>
            {/* <pre>
                {JSON.stringify(components, null, 2)}
            </pre> */}
            {renderComponents(components)}
        </>
    )
}