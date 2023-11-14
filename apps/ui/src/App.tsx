import logo from './assets/logo.png'
import './App.css'
import { Button, Form, Layout, Select } from 'antd'
import { Header } from 'antd/es/layout/layout'
import { useCallback, useEffect, useState } from 'react'
import { serialHandler } from './serialHelper'

function App() {

  const [ports, setPorts] = useState<any[]>([]);
  const [connection, setConnection] = useState<any>(null);

  const getPorts = useCallback(async () => {
    const filters = [
      { usbVendorId: 0x2341, usbProductId: 0x0043 },
      { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ]
    const port = await navigator.serial.getPorts()
    console.log(port)
  }, [setPorts])

  const onConnect = useCallback((path: string) => {
  }, [setConnection])

  useEffect(() => {
    if (connection) {

    }
  }, [connection])

  useEffect(() => {
    getPorts()
  }, [])

  return (
    <>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} style={{
            width: '50%', objectFit: 'contain',
            height: 'auto'
          }} />
        </Header>
        <Button onClick={() => getPorts()} >Connect</Button>
        <Button onClick={() => serialHandler.write("1")} >Send</Button>

        <Form>
          <Form.Item label="Device">
            <Select onSelect={(v) => onConnect(String(v))}>
              {ports.map(e => <Select.Option value={e.path} key={e.path}>{e.path}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Layout>
    </>
  )
}

export default App
