import { createRoot } from 'react-dom/client'
import Hello from './Hello.jsx'
import React from 'react'
import './main.css'

createRoot(document.getElementById('app')).render(
    <Hello />
)