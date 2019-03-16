export const spliceObj = (obj) =>{
    let spliced = {};
    Object.keys(obj).forEach(k => {
            spliced[k] = obj[k] 
        })
        return spliced;
    }