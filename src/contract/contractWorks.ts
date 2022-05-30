import { ENV } from '../configs/env'
import appConfig from '../configs/app.config'

import fs from 'fs'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

const chainId = 4
const contractAddress = appConfig.contract_address
var web3 = new Web3(new Web3.providers.WebsocketProvider(`${ENV.PROVIDER_URL}${ENV.PROJECT_ID}`))

export const init = async () => {
    const contract = getContract(getAbi())

    const reciever = ENV.ADDRESS // получатель денег
    const recieverPrivateKey = ENV.ADDRESS_PRIVATE_KEY // приват ключ получателя 

    const signerAddress = ENV.SIGNER_ADDRESS
    const signerAddressPrivateKey = ENV.SIGNER_ADDRESS_PRIVATE_KEY

    const amount = "10000000000000000000"
    const nonce = 1 // номер withdraw

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
    const hash = await contract.methods.packCoupon(
        reciever,
        amount,
        nonce,
        chainId,
        contractAddress
    ).call()
    console.log('hash', hash)

    // 2. Sign hash
    console.log('sign coupon hash'.blue())
    const signed = web3.eth.accounts.sign(hash, signerAddressPrivateKey)
    console.log('signed hash', signed)

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