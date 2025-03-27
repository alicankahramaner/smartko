import logo from './assets/logo.png'
import './App.css'
import { Button, Col, Divider, FloatButton, Form, Input, Layout, List, Modal, notification, Row, Select } from 'antd'
import { Header } from 'antd/es/layout/layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { serialHandler } from './serialHelper'
import { DataType, ProfileType } from './type'
import { CloudUploadOutlined, DeleteOutlined, EditOutlined, MoreOutlined, PlusCircleFilled, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { KeyCap } from './components/keyCap/keyCap'
import { useBrowserStorage } from './hooks/browserStorage'
import { useForm } from 'antd/es/form/Form'
import { DataTypeToSerial, randomNumber } from './util'
import { ProfileModal } from './components/profileModal'
import { KeyModal } from './components/keyModal'
function App() {
  const storage = useBrowserStorage();

  const [profiles, setProfiles] = useState<ProfileType[]>([])
  const [selectedProfile, setSelectedProfile] = useState<number>(-1);
  const [profileModal, setProfileModal] = useState(-1);
  const [keyModal, setKeyModal] = useState(false);


  const keyDatas = useMemo(() => {
    if (selectedProfile === -1) return [];
    const profile = profiles.find(e => e.id === selectedProfile);
    if (!profile || !profile.data.length) return [];
    return profile.data;
  }, [selectedProfile, profiles]);

  const getProfiles = useCallback(async () => {
    const profilesData = await storage.read('profiles');
    if (!profilesData) return;
    setProfiles(profilesData)
  }, [storage, profiles, setProfiles])

  useEffect(() => {
    getProfiles()
  }, [])


  const [load, setLoad] = useState(false);

  const [profileForm] = useForm()
  const [keyForm] = useForm()

  const onSelectProfile = useCallback((id: number) => {
    setSelectedProfile(id)
  }, [setSelectedProfile])

  const sendDataDevice = useCallback(() => {
    const profile = profiles.find(e => e.id === selectedProfile);
    if (!profile) return;
    if (!profile.data.length) return;
    console.log("asd", profile);
    window.electronAPI.sendMessage({ type: 'update', data: `UPDATE ${DataTypeToSerial(profile.data)}` })
  }, [profiles, selectedProfile])

  return (
    <>
      <ProfileModal
        onCancel={() => setProfileModal(-1)}
        onDone={() => {
          setProfileModal(-1);
          getProfiles();
        }}
        profileId={profileModal}
        profiles={profiles}
      />

      <KeyModal
        onCancel={() => setKeyModal(false)}
        onDone={() => {
          setKeyModal(false);
          getProfiles();
        }}
        profileId={selectedProfile}
        profiles={profiles}
        open={keyModal}
      />
      <Layout style={{ height: '100vh' }}>
        <Layout.Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3e3e3e'
          }}>
          <img src={logo} style={{
            width: '50%', objectFit: 'contain',
            height: 'auto'
          }} />
        </Layout.Header>
        <Layout.Content>
          <Row style={{ padding: '10px 0px' }} gutter={[0, 12]} justify={"center"} align={"middle"}>
            <Col span={10} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Select onSelect={(v) => onSelectProfile(v)}
                style={{ width: '100%' }} placeholder="Profil" >
                {profiles.map(e => <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>)}
              </Select>
            </Col>
            <Col span={10} style={{ gap: 10, display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={() => setProfileModal(0)}
                type='primary' icon={<PlusCircleFilled />} />
              <Button onClick={() => setProfileModal(selectedProfile)} icon={<EditOutlined />} />
              <Button danger icon={<DeleteOutlined />} />
            </Col>
            <Divider />
          </Row>
        </Layout.Content>
        <div
          style={{
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <List
            dataSource={keyDatas}
            style={{ margin: '20px auto', width: 200 }}
            renderItem={(i) => {
              return <List.Item key={i.id} style={{ display: 'flex', flexBasis: "50%", flexDirection: 'column', gap: 20 }}>
                <KeyCap keyName={i.key} />
                <Input
                  style={{ textAlign: 'center' }}
                  styles={{
                    input: {
                      textAlign: 'center'
                    }
                  }}
                  onChange={(e) => {
                    const delay = Number(e.target.value);
                    const newProfileList = profiles.map(p => {
                      if (p.id === selectedProfile) {
                        p.data.forEach(k => {
                          if (k.id === i.id) {
                            k.delay = delay;
                          }
                        })
                      }

                      return p;
                    })
                    storage.update('profiles', newProfileList);
                    getProfiles()
                  }}
                  suffix={"ms"}
                  prefix={<UploadOutlined />}
                  value={i.delay}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {

                    const newProfileList = profiles.map(p => {
                      if (p.id === selectedProfile) {
                        p.data = p.data.filter(e => e.id !== i.id)
                      }

                      return p;
                    })
                    storage.update('profiles', newProfileList);
                    getProfiles()
                  }}
                />
              </List.Item>
            }}
          />
        </div>
      </Layout>
      <FloatButton.Group>
        <FloatButton onClick={() => sendDataDevice()} tooltip="Pedal'a Yükle" icon={<CloudUploadOutlined />} />
        {selectedProfile > 0 && <FloatButton type='primary' onClick={() => setKeyModal(true)} tooltip="Tuş Ekle" icon={<PlusOutlined />} />}
      </FloatButton.Group>
    </>
  )
}

export default App
