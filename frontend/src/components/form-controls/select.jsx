import React from 'react'

const Select = ({
    name,
    onChange,
    value,
    options = [],
    outerClassName = "mb-3",
    label = {
        text: '',
        props: {}
    },
    error = {
        text: null,
        props: {}
    },
    help = {
        text: null,
        props: {}
    },
    ...props
}) => {
    return (
        <div className={outerClassName}>
            {
                label.text && <label className="form-label" {...label.props}>{label.text}</label>
            }
            <select name={name} onChange={onChange} value={value} {...props}>
                {
                    options.map(({ value, label }, index) => <option style={{ background: "#000" }} key={index} value={value}>{label}</option>)
                }
            </select>
            {error.text && <small {...error.props}>{error.text}</small>}
            {help.text && <small {...help.props}>{help.text}</small>}
        </div>
    )
}

export default Select