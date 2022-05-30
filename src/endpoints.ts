import express from 'express'

import { ENV } from './configs/env'

var app = express()
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

const getBearerToken = (auth: string | undefined) => {
    const PREFIX = `Bearer `
    if (!auth || !auth.toLowerCase().startsWith(PREFIX.toLowerCase()))
        return undefined

    let token = auth.substring(PREFIX.length)
    return token
}

export const init = async () => {
    const port = ENV.PORT || 3000
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`))

    app.get('/v', (req, res) => {
        res.json({
            name: require('../package.json').name,
            v: require('../package.json').version
        })
    })
}

