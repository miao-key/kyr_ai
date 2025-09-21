import { useDrop } from "react-dnd";
import { useRef } from "react";
import { useComponentConfigStore } from "../stores/component-config";
import { useComponentsStore } from "../stores/components";

export function useMaterialDrop(accept: string[], id: number) {
    const {
        addComponent
    } = useComponentsStore();
    const { componentConfigs } = useComponentConfigStore();
    const ref = useRef<HTMLDivElement>(null);
    
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

    // 连接 drop ref
    drop(ref);
    
    return {
        canDrop,
        drop: ref
    }
}