import { Form, Input, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { useBrowserStorage } from "../hooks/browserStorage";
import { ProfileType } from "../type";
import { randomNumber } from "../util";
import { useEffect } from "react";

export const ProfileModal = (props: {
    profileId: number;
    onDone(): void;
    onCancel(): void;
    profiles: ProfileType[];
}) => {
    const [form] = useForm();
    const storage = useBrowserStorage();

    useEffect(() => {
        if (props.profileId > 0) {
            const p = props.profiles.find(e => e.id === props.profileId);
            if (!p) return;
            form.setFieldValue("name", p.name);
        }

    }, [props.profileId])

    return (
        <Modal
            open={props.profileId !== -1}
            title={props.profileId > 0 ? "Profil Düzenle" : "Yeni Profil"}
            onCancel={() => {
                form.resetFields();
                props.onCancel();
            }}
            okButtonProps={{
                htmlType: 'submit',
                form: 'profileForm'
            }}
        >
            <Form
                form={form}
                id="profileForm"
                onFinish={async (v) => {
                    var profiles: ProfileType[] | false = await storage.read('profiles');
                    if (!profiles) {
                        profiles = [];
                    }

                    if (props.profileId > 0) {
                        profiles.forEach(e=>{
                            if(e.id === props.profileId){
                                e.name = v.name
                            }
                        })
                    } else {
                        profiles.push({
                            data: [],
                            id: randomNumber(),
                            name: v.name
                        });
                    }

                    await storage.update("profiles", profiles);
                    form.resetFields();
                    props.onDone();
                }}
            >
                <Form.Item required label="Profil Adı" name={"name"}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}