import styles from './waterfall.module.css';
import { 
    useRef,
    useEffect
} from 'react';
import ImageCard from '@/components/ImageCard';

const Waterfall = (props) => {
    const loader = useRef(null);
    const {
        images,
        fetchMore,
        loading
    } = props;

    useEffect(() => {
        // ref 出现在视窗 intersectionObserver
        // 观察者
        const observer = new IntersectionObserver(([entry]) => {
            console.log(entry);
            if (entry.isIntersecting) {
                fetchMore();
            }
        })
        if (loader.current) observer.observe(loader.current);
    },[])
    return (
        <div className={styles.wrapper}>
            <div className={styles.column}>
                {
                    images.filter((_, i) => i % 2 === 0).map((image) => (
                        <ImageCard key ={image.id} {...image}/>
                    ))
                }
            </div>
            <div className={styles.column}>
            {
                    images.filter((_, i) => i % 2 === 1).map((image) => (
                        <ImageCard key ={image.id} {...image}/>
                    ))
                }
            </div>
            <div ref={loader} className={styles.loader}>加载中...</div>
        </div>
    )
}

export default Waterfall;