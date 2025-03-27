import './style.css';
export const KeyCap = (props: { keyName: string, disabled?: boolean }) => {

    return (
        <>
            <div className={`key ${props.disabled ? 'disabled' : ''}`}>
                <div className="key-cotnent">{props.keyName}</div>
            </div>
        </>
    )
}