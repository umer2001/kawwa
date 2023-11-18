import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <header id="header">

            <img src="kawwa-logo.svg" alt="Crow Looking Behind Logo" />
            <Link className='sd-btn-md py-3' to="/blend" >Start Blending</Link>
        </header>
    )
}

export default Header