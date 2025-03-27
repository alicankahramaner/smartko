import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ConfigProvider, theme } from 'antd'
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (data: { type: string, data: any }) => {},
      onMessage: (callback: any) => {}
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {

        },
        algorithm: theme.darkAlgorithm
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
