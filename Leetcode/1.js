/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    let left = 0;
    let ans = 0;
    const C = new Set();
    for(let i=0;i<s.length;i++){
        let c = s[i];
        while(C.has(c)){
            C.delete(s[left]);
            left++;
        }
        C.add(c);
        ans=Math.max(ans,i-left+1);
    }
    return ans;
};