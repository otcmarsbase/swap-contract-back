import dotenv from "dotenv"
import * as rt from "runtypes"

dotenv.config({ })

const EnvConfig = rt.Record({
    PORT: rt.String,
    
    // innfura
    PROJECT_ID: rt.String,
    PROJECT_SECRET: rt.String,
    PROVIDER_URL: rt.String,
    
    // TEST
    SIGNER_ADDRESS: rt.String,
    SIGNER_ADDRESS_PRIVATE_KEY: rt.String,

    ADDRESS: rt.String,
    ADDRESS_PRIVATE_KEY: rt.String,
})

export const ENV = EnvConfig.check(process.env)