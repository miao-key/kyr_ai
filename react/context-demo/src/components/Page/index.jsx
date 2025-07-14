import Child from '../Child'
import {useTheme} from '../../hooks/useTheme'
const Page = () => {
    const theme = useTheme();
    return(
        <>
            <Child />
        </>
    )
}

export default Page
