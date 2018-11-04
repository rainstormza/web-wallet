import bip39 from 'bip39'
import hdkey from 'hdkey'
import ethUtil from 'ethereumjs-util'

function createWallet() {
  const mnemonic = bip39.generateMnemonic() // generates string
  return implementMnemonic(mnemonic)
}

function importWallet(mnemonic) {
  return implementMnemonic(mnemonic)
}

function implementMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeed(mnemonic) // creates seed buffer
  // const seedWithPass = bip39.mnemonicToSeed(mnemonic, '123') // creates seed buffer wih passphrase
  const root = hdkey.fromMasterSeed(seed)
  // const masterPrivateKey = root.privateKey.toString('hex')
  const addrNode = root.derive("m/44'/60'/0'/0/0")
  const pubKey = ethUtil.privateToPublic(addrNode._privateKey)
  const addr = ethUtil.publicToAddress(pubKey).toString('hex')
  const address = ethUtil.toChecksumAddress(addr)

  const ethAddress = {
    private: addrNode._privateKey.toString('hex'),
    public: address
  }

  return {
    mnemonic,
    ethAddress
  }
}

// console.log('mnemonic: ', mnemonic)
// console.log(bip39.validateMnemonic(mnemonic))
// console.log('seed: ', seed)
// // console.log('addrNode: ', addrNode)
// console.log('addrNode._privateKey: ', addrNode._privateKey.toString('hex'))
// console.log('pubKey: ', pubKey)
// console.log('addr: ', addr)
// console.log('address: ', address)

export default {
  createWallet,
  importWallet
}

// bitcoin testnet
// {
//   "private": "58831608119a3fd472425f33d90ce5c2d65db14f50ae7bc954729e75bcea9a9b",
//   "public": "03ab5e7e79709cf4214278ba3efcaf63568bda06f574071ec331870d81b5f05167",
//   "address": "mjh5VmtqWjEeQXL9sbdYPe5joHcNNbWKzK",
//   "wif": "cQYktWjuUv2omrNCbgBN25U5kitfx7L8bALxGj8nzEq5u2MVrxLb"
// }

// balance
// https://live.blockcypher.com/btc-testnet/address/mjh5VmtqWjEeQXL9sbdYPe5joHcNNbWKzK/

// generate address
// curl -X POST https://api.blockcypher.com/v1/btc/test3/addrs
