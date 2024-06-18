import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ArweaveWalletKit } from '@arweave-wallet-kit/react'
import ArConnectStrategy from '@arweave-wallet-kit/arconnect-strategy'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: [
          'ACCESS_ADDRESS',
          'ACCESS_ALL_ADDRESSES',
          'SIGN_TRANSACTION',
          'DISPATCH',
        ],
        ensurePermissions: true,
        strategies: [new ArConnectStrategy()],
      }}
    >
      <App />
    </ArweaveWalletKit>
  </React.StrictMode>,
)
