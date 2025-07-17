/**
 * @param {number} n
 * @return {number[][]}
 */
var generateMatrix = function(n) {
    const DIRS = [[0,1],[1,0],[0,-1],[-1,0]];
    const ans = Array.from({ length: n }, () => Array(n).fill(0));
    let i=0,j=0,di=0;
    for(let k = 1;k <= n*n;k++){
        ans[i][j] = k;
        const x = i+DIRS[di][0];
        const y = j+DIRS[di][1];
        if(x >= n || x < 0 || y >= n || y < 0 || ans[x][y] !== 0 ){
            di = (di+1)%4
        }
        i+=DIRS[di][0];
        j+=DIRS[di][1];
    }
    return ans;

};