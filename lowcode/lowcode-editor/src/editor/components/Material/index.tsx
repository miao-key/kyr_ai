import {
    useMemo
} from 'react';
import { useComponentConfigStore } from '../../stores/component-config';
import { MaterialItem } from '../Materialltem';

export function Material() {
    const { componentConfigs } = useComponentConfigStore();
    const components = useMemo(() => {
        return Object.values(componentConfigs);
    }, [componentConfigs]);
    return (
        <div>
            {
                components.map(item => {
                   return <MaterialItem key={item.name} name={item.name} />
                })
            }
        </div>
    )
}