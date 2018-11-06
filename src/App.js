import React, { Component, Fragment } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Fade from '@material-ui/core/Fade'
import TextField from '@material-ui/core/TextField'
import Modal from '@material-ui/core/Modal'
import mnemonicUtil, { validateMnemonic } from './utils/mnemonic'
import web3, { sendTx, fromWei } from './utils/web3'
import NumberFormatCustom from './utils/NumberFormatCustom'

// const subscription = web3.web3Socket.eth
//   .subscribe('pendingTransactions', (error, result) => {
//     if (error) console.log(error)
//   })
//   .on('data', function(txHash) {
//     console.log(txHash)
//   })

// // unsubscribes the subscription
// subscription.unsubscribe(function(error, success) {
//   if (success) console.log('Successfully unsubscribed!')
// })

const isMnemonicValid = () => {
  if (
    localStorage.getItem('mnemonic') === null &&
    !validateMnemonic(localStorage.getItem('mnemonic'))
  ) {
    localStorage.removeItem('mnemonic')
    return false
  }
  return true
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ButtonExtend = styled(Button)`
  && {
    font-size: 1.3rem;
    height: 60px;
    width: 300px;
    margin: 10px 0;
    padding: 0 30px;
    text-transform: none;
  }
`

const ButtonGradient = styled(ButtonExtend)`
  && {
    background: linear-gradient(45deg, #2196f3 30%, #21cbf3 90%);
    box-shadow: 0 3px 5px 2px rgba(33, 203, 243, 0.3);
    border-radius: 3;
    border: 0;
    color: white;
  }
`

const PaperExtend = styled(Paper)`
  padding: 2rem;
  text-align: center;
`

const MnemonicContainer = styled.div`
  ul {
    display: grid;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin: 40px 0;
    padding: 0;
    li {
      border-bottom: 1px solid #e0e0e0;
      color: #999;
      font-size: 14px;
      padding: 10px 0;
      list-style-type: none;
      span {
        color: black;
        margin-left: 10px;
        font-size: 1.2rem;
      }
    }
  }
`

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 1rem;
`

const ETHLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  border: 1px solid #999;
  margin-bottom: 10px;
`

const CardContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
`

const ContentContainer = styled.div`
  /* text-align: left; */
  font-size: 1.2rem;
  flex: 1 1 0%;
`

const BackContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`

const FaucetContainer = styled.div`
  margin-top: 3rem;
`

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    position: 'absolute',
    backgroundColor: 'white',
    outline: 'none'
  }
}

class App extends Component {
  state = {
    mnemonic: '',
    ethAddress: null,
    step: isMnemonicValid() ? 'dashboard' : '',
    recipientAddress: '',
    amount: 0,
    open: false,
    balance: 0
  }

  componentDidMount() {
    if (isMnemonicValid()) {
      const storageMnemonic = localStorage.getItem('mnemonic')
      const { mnemonic, ethAddress } = mnemonicUtil.importWallet(
        storageMnemonic
      )
      this.setState({ mnemonic, ethAddress, step: 'dashboard' })
      localStorage.setItem('mnemonic', storageMnemonic)
      this.fetchBalance(ethAddress.public)
    }
  }

  fetchBalance = async publicKey => {
    try {
      const balance = await web3.web3.eth.getBalance(publicKey)
      const balanceToEther = Number(fromWei(balance, 'ether')).toFixed(5)
      this.setState({ balance: balanceToEther })
    } catch (error) {
      console.log('fetch balance error')
      console.log('error: ', error)
    }
  }

  handleCraeteWallet = () => {
    const { mnemonic, ethAddress } = mnemonicUtil.createWallet()
    this.setState({ mnemonic, ethAddress, step: 'create' })
  }

  handleConfirmCrateWallet = () => {
    if (this.state.mnemonic && this.state.ethAddress) {
      localStorage.setItem('mnemonic', this.state.mnemonic)
      this.setState({ step: 'dashboard' })
      this.fetchBalance(this.state.ethAddress.public)
    }
  }

  handleImportWallet = () => {
    this.setState({ step: 'import' })
  }

  handleConfirmImportWallet = () => {
    if (validateMnemonic(this.state.mnemonic)) {
      const { mnemonic, ethAddress } = mnemonicUtil.importWallet(
        this.state.mnemonic
      )
      this.setState({ mnemonic, ethAddress, step: 'dashboard' })
      localStorage.setItem('mnemonic', this.state.mnemonic)
      this.fetchBalance(ethAddress.public)
    } else {
      console.log('import error')
    }
  }

  handleSendTx = async () => {
    const { recipientAddress, amount, balance, ethAddress } = this.state
    const isAddressValid = web3.web3.utils.isAddress(recipientAddress)
    const isBalanceValid = balance > amount
    if (isAddressValid && isBalanceValid) {
      try {
        const txHash = await sendTx(
          ethAddress.public,
          ethAddress.private,
          recipientAddress,
          amount
        )
        console.log('txHash: ', txHash)

        this.handleClose()
      } catch (error) {
        console.log('sendTx error')
        console.log('error: ', error)
      }
    } else {
      console.log('sendTx error')
    }
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleClearState = () => {
    this.setState({
      mnemonic: '',
      ethAddress: null,
      step: '',
      recipientAddress: '',
      amount: 0,
      open: false,
      balance: 0
    })
    localStorage.removeItem('mnemonic')
  }

  render() {
    console.log('state: ', this.state)
    const { mnemonic, ethAddress, step, balance } = this.state

    return (
      <Fragment>
        <GlobalStyle />

        <Container>
          {step !== '' && (
            <BackContainer>
              <ButtonGradient
                onClick={this.handleClearState}
                style={{ fontSize: '1rem', width: '100px' }}
              >
                Back
              </ButtonGradient>
            </BackContainer>
          )}
          {step === '' && (
            <Fade in={true}>
              <ButtonContainer>
                <ButtonGradient onClick={this.handleCraeteWallet}>
                  Create a wallet
                </ButtonGradient>
                <ButtonExtend
                  variant="outlined"
                  color="primary"
                  onClick={this.handleImportWallet}
                >
                  Import a wallet
                </ButtonExtend>
              </ButtonContainer>
            </Fade>
          )}

          {step === 'create' && (
            <Fade in={true}>
              <PaperExtend elevation={4}>
                <Typography variant="h4" component="h4" gutterBottom>
                  Write down mnemonic phrase key
                </Typography>
                <MnemonicContainer>
                  <ul>
                    {mnemonic &&
                      mnemonic.split(' ').map((item, i) => {
                        return (
                          <Fade
                            key={item}
                            in={Boolean(mnemonic)}
                            timeout={i * 500}
                          >
                            <li>
                              {`${i + 1}.`}
                              <span>{item}</span>
                            </li>
                          </Fade>
                        )
                      })}
                  </ul>
                </MnemonicContainer>

                <ButtonGradient
                  onClick={this.handleConfirmCrateWallet}
                  style={{ fontSize: '1rem' }}
                >
                  I already wrote down the key
                </ButtonGradient>
              </PaperExtend>
            </Fade>
          )}

          {step === 'import' && (
            <Fade in={true}>
              <PaperExtend elevation={4}>
                <Typography variant="h4" component="h4" gutterBottom>
                  Your backup phrase
                </Typography>
                <Typography variant="h5" component="h5" gutterBottom>
                  Enter your backup phrase below:
                </Typography>
                <div>
                  <TextField
                    id="standard-multiline-static"
                    multiline
                    rows="4"
                    margin="normal"
                    style={{ width: '400px' }}
                    onChange={event => {
                      this.setState({ mnemonic: event.target.value })
                    }}
                  />
                </div>
                <ButtonGradient
                  onClick={this.handleConfirmImportWallet}
                  style={{ fontSize: '1rem' }}
                >
                  Confirm
                </ButtonGradient>
              </PaperExtend>
            </Fade>
          )}

          {step === 'dashboard' && (
            <Fade in={true}>
              <PaperExtend elevation={4}>
                <Typography variant="h4" component="h4" gutterBottom>
                  Wallet Dashboard
                </Typography>
                <CardContainer>
                  <LogoContainer>
                    <ETHLogo>
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 13 20"
                        type="Ether"
                      >
                        <g fill="#414141" fillRule="evenodd">
                          <path d="M6.675 14.956v5.023l6.154-8.611zM6.675 13.793l6.154-3.628-6.154-2.727z" />
                          <path d="M6.675.02v7.418l6.154 2.727zM6.675 19.98v-5.024L.52 11.368z" />
                          <path d="M.52 10.165l6.155 3.628V7.438z" />
                          <path d="M6.675.02L.52 10.166l6.154-2.727z" />
                        </g>
                      </svg>
                    </ETHLogo>
                    <div>ETH</div>
                  </LogoContainer>
                  <ContentContainer>
                    {ethAddress && <div>{ethAddress.public}</div>}
                    <br />
                    <div>{balance} ETH</div>
                  </ContentContainer>
                </CardContainer>
                <ButtonGradient
                  onClick={this.handleOpen}
                  style={{ fontSize: '1rem', height: '50px' }}
                >
                  Send ETH
                </ButtonGradient>

                <FaucetContainer>
                  <Typography variant="h5" component="h5" gutterBottom>
                    Get free ether (rinkeby network)
                  </Typography>
                  <Typography variant="h5" component="h5" gutterBottom>
                    <a
                      href="http://rinkeby-faucet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      http://rinkeby-faucet.com
                    </a>
                  </Typography>
                </FaucetContainer>
              </PaperExtend>
            </Fade>
          )}
        </Container>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose}
        >
          <div style={getModalStyle()}>
            <PaperExtend elevation={4}>
              <Typography variant="h4" component="h4" gutterBottom>
                Send ETH
              </Typography>
              <CardContainer>
                <LogoContainer>
                  <ETHLogo>
                    <svg
                      width="50"
                      height="50"
                      viewBox="0 0 13 20"
                      type="Ether"
                    >
                      <g fill="#414141" fillRule="evenodd">
                        <path d="M6.675 14.956v5.023l6.154-8.611zM6.675 13.793l6.154-3.628-6.154-2.727z" />
                        <path d="M6.675.02v7.418l6.154 2.727zM6.675 19.98v-5.024L.52 11.368z" />
                        <path d="M.52 10.165l6.155 3.628V7.438z" />
                        <path d="M6.675.02L.52 10.166l6.154-2.727z" />
                      </g>
                    </svg>
                  </ETHLogo>
                  <div>ETH</div>
                </LogoContainer>
              </CardContainer>
              <div>
                <TextField
                  margin="normal"
                  placeholder="Recipient Address"
                  onChange={event =>
                    this.setState({ recipientAddress: event.target.value })
                  }
                />
                <br />
                <TextField
                  margin="normal"
                  placeholder="Amount"
                  onChange={event =>
                    this.setState({
                      amount: Number(event.target.value)
                    })
                  }
                  InputProps={{
                    inputComponent: NumberFormatCustom
                  }}
                />
              </div>
              <ButtonGradient
                onClick={this.handleSendTx}
                style={{ fontSize: '1rem', height: '50px' }}
              >
                Confirm
              </ButtonGradient>
            </PaperExtend>
          </div>
        </Modal>
      </Fragment>
    )
  }
}

export default App
