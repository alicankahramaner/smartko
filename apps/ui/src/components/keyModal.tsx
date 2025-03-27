import { Form, Input, Modal } from "antd";
import { useCallback } from "react";
import { ProfileType } from "../type";
import { useForm } from "antd/es/form/Form";
import { useBrowserStorage } from "../hooks/browserStorage";
import { randomNumber } from "../util";

export const KeyModal = (props: {
    profileId: number;
    onDone(): void;
    onCancel(): void;
    profiles: ProfileType[];
    open: boolean;

}) => {
    const [form] = useForm();
    const storage = useBrowserStorage();

    const keyInput = useCallback((inputElement: any) => {
        if (props.open) return;
        if (inputElement) {
            inputElement.focus();
        }
    }, [props]);

    return (
        <Modal
            open={props.open}
            title={"Tuş Tanımlama"}
            onCancel={() => {
                props.onCancel();
            }}
            okButtonProps={{
                htmlType: 'submit',
                form: 'keyForm'
            }}
        >
            <Form
                form={form}
                id="keyForm"
                onFinish={async (v) => {
                    var profiles: ProfileType[] | false = await storage.read('profiles');
                    if (!profiles) return;

                    const profile = profiles.find(e => e.id === props.profileId);
                    if (!profile) return;

                    profile.data.push({
                        id: randomNumber(),
                        delay: 100,
                        key: v.keycode
                    });

                    profiles.forEach(e => {
                        if (e.id === props.profileId) {
                            e.data = profile.data;
                        }
                    })

                    await storage.update("profiles", profiles);
                    form.resetFields();
                    props.onDone();
                }}
            >
                <Form.Item required label="Tuş" name={"keycode"}>
                    <Input ref={keyInput} maxLength={1} autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    )
}