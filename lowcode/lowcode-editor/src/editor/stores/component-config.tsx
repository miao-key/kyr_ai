import { create } from 'zustand';
import Container from '../materials/Container';
import Button from '../materials/Button';
import Page from '../materials/Page';

export interface ComponentConfig {
    name: string;
    // 对象的类型
    defaultProps: Record<string, any>;
    component: any;
}

interface State {
    componentConfigs: { [key: string]: ComponentConfig }
}

interface Action {
    registerComponent: (name: string,
        componentConfig: ComponentConfig) => void;
}

export const useComponentConfigStore = create<State & Action>((set) => ({
    componentConfigs: {
        Container: {
            name: 'Container',
            defaultProps: {},
            component: Container,
        },
        Button: {
            name: 'Button',
            defaultProps: {
                type: 'primary',
                text: '按钮',
            },
            component: Button
        },
        Page: {
            name: 'Page',
            defaultProps: {},
            component: Page,
        },
    },
    // 添加配置
    registerComponent: (name, componentConfig) => set((state)=> {
        return {
            ...state,
            componentConfig:{
                ...state.componentConfigs,
                [name]: componentConfig,
            }
        }
    }),
}))
