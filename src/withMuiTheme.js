import React from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import blue from '@material-ui/core/colors/blue'
import common from '@material-ui/core/colors/common'

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: blue,
    secondary: {
      main: common.white
    },
    background: {
      // default: '#eceff1'
    }
  },
  overrides: {}
})
const withMuiTheme = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export default withMuiTheme
