export const CryptoJS = require('crypto-js')

export const encrypt = (message: string) => {
    return CryptoJS.AES.encrypt(message, process.env.CRYPTO_KEY).toString()
}

export const decrypt = (message: string) => {
    const bytes = CryptoJS.AES.decrypt(message, process.env.CRYPTO_KEY)
    const originalText = bytes.toString(CryptoJS.enc.Utf8)
    return originalText
}