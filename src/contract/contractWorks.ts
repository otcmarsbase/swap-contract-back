import { ENV } from '../configs/env'
import appConfig from '../configs/app.config'

import fs from 'fs'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import secp256k1 from 'secp256k1'

const chainId = 4
const contractAddress = appConfig.contract_address
var web3 = new Web3(new Web3.providers.WebsocketProvider(`${ENV.PROVIDER_URL}${ENV.PROJECT_ID}`))

export const init = async () => {
    const contract = getContract(getAbi())

    const reciever = ENV.ADDRESS 
    const recieverPrivateKey = ENV.ADDRESS_PRIVATE_KEY

    const signerAddress = ENV.SIGNER_ADDRESS
    const signerAddressPrivateKey = ENV.SIGNER_ADDRESS_PRIVATE_KEY

    const amount = "10000000000000000000"
    const nonce = 0 // the nonce of widthdraw

    console.log('input info'.blue(), {
        reciever: reciever,
        signerAddress: signerAddress,
        amount: amount,
        nonce: nonce,
    })

    // 0. Set coupon signer 
    // console.log('set coupon signer'.blue())
    // const txSetCouponSigner = contract.methods.setCouponSigner(signerAddress)
    // await signTx(txSetCouponSigner, reciever, recieverPrivateKey)

    console.log('get coupon signer'.blue())
    const couponSigner = await contract.methods.getCouponSigner().call({})

    console.log(`couponSigner ${couponSigner}`)
    if (couponSigner != signerAddress)
        return

    // 1. Get hash
    console.log('get coupon hash'.blue())
    const hash = await contract.methods.couponHash(
        reciever,
        amount,
        nonce,
        chainId,
        contractAddress
    ).call()
    console.log('hash', hash)

    // 2. Sign hash
    console.log('sign coupon hash'.blue())
    const ecdsaSign = secp256k1.ecdsaSign(fromHexString(hash)!, fromHexString(signerAddressPrivateKey)!)
    const signed = ecsign(ecdsaSign)
    console.log('signed hash', signed)

    // return

    // 3. Make 
    const txDataWithdraw = await contract.methods.withdraw(
        {
            receiver: reciever,
            amount: amount,
            nonce: nonce,
            chainId: chainId,
            contractAddress: contractAddress
        },
        {
            v: signed.v,
            r: signed.r,
            s: signed.s
        }
    )

    console.log('sign withdraw'.blue())
    await signTx(txDataWithdraw, reciever, recieverPrivateKey)
    // console.log('signed')

    console.log("✅ Contract works initialized!")
}

const signTx = async (txData: any, fromAddress: string, privateKey: string) => {
    const contract = getContract(getAbi())
    const txGas = await txData.estimateGas({ from: fromAddress })
    const gasPrice = await web3.eth.getGasPrice()
    const data = txData.encodeABI()
    const nonce = await web3.eth.getTransactionCount(fromAddress)
    const acc = web3.eth.accounts.privateKeyToAccount(privateKey)
    const tx = {
        from: fromAddress,
        to: contract.options.address,
        data: data,
        gas: txGas,
        gasPrice: gasPrice,
        value: "0",
        nonce: nonce,
        chainId: chainId,
    }
    const signedTx = await acc.signTransaction(tx)
    if (signedTx && signedTx.rawTransaction) {
        const reciept = await web3.eth.sendSignedTransaction(signedTx.rawTransaction.toString())
        console.log('reciept', reciept)
    }
}

const getAbi = () => {
    const src = JSON.parse(fs.readFileSync('./contract.abi').toString())
    return src?.abi || src
}

export const getContract = (abi: AbiItem[]) => {
    const contract = new web3.eth.Contract(abi, contractAddress)
    return contract
}

const fromHexString = (hexString: string) => {
    const value = hexString.replace('0x', '').match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16))
    if (!value) return undefined
    return Uint8Array.from(value)
}

const ecsign = (sig: any) => {
    return {
        r: sig.signature.slice(0, 32),
        s: sig.signature.slice(32, 64),
        v: sig.recid + 27
    }
}