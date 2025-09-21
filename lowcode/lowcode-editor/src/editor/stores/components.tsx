// 编辑区域的数据由store管理
import { create } from 'zustand';
// parentId + children 可以构建出一个树结构
export interface Component {
  id: number;
  name: string;
  props?: any;
  desc?: string;
  children?: Component[];
  parentId?: number;
}

interface State {
  components: Component[]
}
// store 主要提供 State & Actions 

interface Action {
  addComponent: (component: Component, parentId?: number) => void;
  deleteComponent: (componentId: number) => void;
  updateComponentProps: (componentId: number, props: any) => void;
}
// 交叉类型
export const useComponentsStore = create<State & Action>(
  (
    (set) => ({
        components: [
          {
            id: 1,
            name: 'Page',
            props: {},
            desc: '页面'
          }
        ],
        addComponent: (component, parentId) => set((state) => {
           if (parentId) {
            const parentComponent = getComponentById(
                parentId,
                state.components
            );
            if (parentComponent) {
                if(parentComponent.children) {
                    parentComponent.children.push(component);
                } else {
                    parentComponent.children = [component];
                }
                component.parentId = parentId;
                // 只更新 components 数组，不重复添加
                return {
                    components: [...state.components],
                };
            }
           }
           // 只有没有 parentId 或者找不到父组件时才添加到根级
           return {
               components: [...state.components, component],
           };
        }),
        deleteComponent: (componentId) => {
            if (!componentId) return;
            
            set((state) => {
                const component = getComponentById(componentId, state.components);
                if (!component) return state;
                
                if (component.parentId) {
                    // 删除有父组件的子组件
                    const parentComponent = getComponentById(
                        component.parentId,
                        state.components
                    );
                    if (parentComponent) {
                        parentComponent.children = parentComponent?.children?.filter(
                            (child) => child.id !== componentId
                        );
                    }
                    return { components: [...state.components] };
                } else {
                    // 删除根级组件
                    return {
                        components: state.components.filter(
                            (comp) => comp.id !== componentId
                        )
                    };
                }
            });
        },
        updateComponentProps: (componentId: number, props: any) => {
            set((state) => {
                const component = getComponentById(componentId, state.components);
                if (component) {
                    component.props = {
                        ...component.props,
                        ...props
                    };
                    return { components: [...state.components] };
                }
                return state;
            });
        },
    })
  )
)

export function getComponentById(
    id: number | null,
    components: Component[]
): Component | null {
    if(!id) return null;
    // 递归
    for(const component of components) {
        if(component.id === id) return component;
        if(component.children && component.children.length > 0) {
            const result = getComponentById(id, component.children);
            if(result !== null) return result;
        }
    }
    return null;
}