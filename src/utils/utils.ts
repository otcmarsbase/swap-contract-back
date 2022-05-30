export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const getCurrentDateFormat = () => {
    const date = new Date()
    return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
}

export const removeItem = <T>(arr: Array<T>, value: T): Array<T> => {
    const index = arr.indexOf(value)
    if (index > -1) {
        arr.splice(index, 1)
    }
    return arr
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const randomRange = (min: number, max: number) => {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

export const json2array = (json: any) => {
    var arr: any = []
    var keys = Object.keys(json)
    keys.forEach((key) => {
        arr.push(json[key])
    })
    return arr
}