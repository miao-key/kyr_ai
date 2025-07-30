import styles from './waterfall.module.css';
import { 
    useRef,
    useEffect,
    useState
} from 'react';
import ImageCard from '@/components/ImageCard';

const Waterfall = (props) => {
    const loader = useRef(null);
    const {
        images,
        fetchMore,
        loading
    } = props;
    
    // 添加左右两列的图片状态
    const [leftImages, setLeftImages] = useState([]);
    const [rightImages, setRightImages] = useState([]);
    
    // 根据图片高度动态分配图片
    useEffect(() => {
        if (!images || images.length === 0) return;
        
        const left = [];
        const right = [];
        let leftHeight = 0;
        let rightHeight = 0;
        
        // 根据累计高度动态分配图片
        images.forEach((image) => {
            // 可以从图片预设高度或根据宽高比估算高度
            const imageHeight = image.height || 200; // 如果没有高度信息，使用预估值
            
            if (leftHeight <= rightHeight) {
                left.push(image);
                leftHeight += imageHeight;
            } else {
                right.push(image);
                rightHeight += imageHeight;
            }
        });
        
        setLeftImages(left);
        setRightImages(right);
    }, [images]);

    useEffect(() => {
        // ref 出现在视窗 intersectionObserver
        // 观察者
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading) {
                fetchMore();
            }
        }, { threshold: 0.1 });
        
        if (loader.current) observer.observe(loader.current);
        
        return () => observer.disconnect();
    }, [fetchMore, loading]);
    
    return (
        <div className={styles.wrapper}>
            <div className={styles.column}>
                {
                    leftImages.map((image) => (
                        <ImageCard 
                            key={image.id} 
                            {...image}
                            onLoad={(e) => {
                                // 可选：记录图片实际加载后的高度，用于更准确的布局
                                // 在实际实现中可以进一步优化
                            }}
                        />
                    ))
                }
            </div>
            <div className={styles.column}>
                {
                    rightImages.map((image) => (
                        <ImageCard 
                            key={image.id} 
                            {...image}
                        />
                    ))
                }
            </div>
            <div ref={loader} className={styles.loader}>加载中...</div>
        </div>
    )
}

export default Waterfall;