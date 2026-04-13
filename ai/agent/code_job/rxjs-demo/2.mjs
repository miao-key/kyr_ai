import {
    from,
    map
} from 'rxjs';

from([1,2,3])
    .pipe(
        map(v => v * 2)
    )
    .subscribe(v => console.log(v));