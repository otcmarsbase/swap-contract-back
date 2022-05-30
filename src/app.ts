import { ENV } from "./configs/env"

import Web3 from 'web3'
import * as endpoints from './endpoints'
import * as contractWorks from './contract/contractWorks'

// For color logs
require('./utils/colorsLog')
import * as colorsLog from './utils/colorsLog'

const init = async () => {
    console.log(`${require('../package.json').name} started...`)
    try {
        await endpoints.init()
        await contractWorks.init()
        console.log(`✅✅✅ Initialization COMPLETE!`.green())
    }
    catch (err) {
        console.log(`❌❌❌ Initialization FAILED!`.red(), err)
    }
}

init()