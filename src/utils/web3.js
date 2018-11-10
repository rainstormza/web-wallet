import Web3 from 'web3'
import EthereumTx from 'ethereumjs-tx'
import { Buffer } from 'safe-buffer'

function toByteArray(hexString) {
  var result = []
  while (hexString.length >= 2) {
    result.push(parseInt(hexString.substring(0, 2), 16))
    hexString = hexString.substring(2, hexString.length)
  }
  return new Buffer(new Uint8Array(result))
}

const provider = new Web3.providers.HttpProvider(
  `${process.env.REACT_APP_INFURA_API_ENDPOINT}/${
    process.env.REACT_APP_INFURA_API_TOKEN
  }`
)
const web3 = new Web3(provider)

// const providerWebSocket = new Web3.providers.WebsocketProvider(
//   `${process.env.REACT_APP_INFURA_SOCKET_ENDPOINT}`
// )
// const web3Socket = new Web3(providerWebSocket)

export const fromWei = (number, unit) => {
  return web3.utils.fromWei(number, unit)
}

export const toWei = (number, unit) => {
  return web3.utils.toWei(number, unit)
}

export async function sendTx(fromAddress, privKey, toAddress, amount = 0) {
  const nonce = await web3.eth.getTransactionCount(fromAddress, 'pending') // get last nonce from tx (including pending tx)
  const privateKey = toByteArray(privKey)
  const txValue = web3.utils.numberToHex(toWei(amount.toString(), 'ether'))

  const rawTx = {
    nonce,
    gasPrice: 10000000000000, // 10000000000000 Wei // 0x09184e72a000
    gasLimit: 22000, // 22000 Wei // 0x55f0
    to: toAddress,
    value: txValue
  }
  let tx = new EthereumTx(rawTx)
  tx.sign(privateKey)
  const serializedTx = tx.serialize()
  // console.log(`serializedTx.toString('hex'): `, serializedTx.toString('hex'))
  const sendTxPromise = new Promise(function(resolve, reject) {
    web3.eth.sendSignedTransaction(
      '0x' + serializedTx.toString('hex'),
      (error, hash) => {
        if (!error) {
          resolve(hash)
        } else {
          reject(error)
        }
      }
    )
    // .on('receipt', data => {
    //   console.log(data)
    // })
  })
  const transactionHash = await sendTxPromise
  return transactionHash
}

// sendTx()

export default {
  web3
  // web3Socket
}
