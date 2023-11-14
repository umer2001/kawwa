import React, { useRef } from 'react'

const Input = ({ name, onChange, value, type, btnText, outerClassName = "mb-3",
    error = {
        text: null,
        props: {}
    },
    help = {
        text: null,
        props: {}
    },
    label = {
        text: null,
        props: {}
    },
    ...props
}) => {

    return <div className={outerClassName}>
        {
            label.text && <label className="form-label" {...label.props}>{label.text}</label>
        }
        {
            type === 'textarea' ?
                <textarea
                    name={name}
                    onChange={onChange}
                    {...props}
                />
                :
                type === 'file' ?
                    <InputFile btnText={btnText} onChange={onChange} value={value} {...props} />
                    :
                    <input name={name} onChange={onChange} type={type} value={value} {...props} />
        }
        {error.text && <small {...error.props}>{error.text}</small>}
        {help.text && <small {...help.props}>{help.text}</small>}
    </div>
}

export default Input

export const InputFile = ({ className, btnText, onChange, value, ...props }) => {
    const fileInput = useRef(null);
    return (
        <>
            <input type="file" hidden style={{ display: "none" }} ref={fileInput} onChange={onChange} {...props} />
            <button className={className} onClick={(e) => {
                e.preventDefault();
                fileInput.current.click();
            }}>{btnText ?? "Upload"}</button>
            {
                value && typeof value === 'object' && (
                    <ul className='ms-3'>
                        {
                            Object.entries(value).map(([key, file], index) => {
                                if (key === 'length') return null;
                                return <li className='green my-1' key={index}>{file.name}</li>
                            })
                        }
                    </ul>
                )
            }
        </>
    )
}
