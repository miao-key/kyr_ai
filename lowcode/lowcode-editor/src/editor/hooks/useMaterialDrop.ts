import { useDrop } from "react-dnd";
import { useComponentConfigStore } from "../stores/component-config";
import { useComponentsStore } from "../stores/components";

export function useMaterialDrop(accept: string[], id: number) {
    const {
        addComponent
    } = useComponentsStore();
    const { componentConfigs } = useComponentConfigStore();
    const [{ canDrop }, drop] = useDrop(()=>({
        accept,
        drop: (item: {type: string},monitor)=>{
            if (monitor.didDrop()) {
                return;
            }
            const props = componentConfigs[item.type].defaultProps;
            addComponent({
                id: new Date().getTime(),
                name: item.type,
                props
            }, id) 
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop()
        })
    }))
    return {
        canDrop,
        drop
    }
}