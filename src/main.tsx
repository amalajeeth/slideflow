import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReactFlowProvider } from '@xyflow/react'
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(
  <ReactFlowProvider>
      <App />
  </ReactFlowProvider>
)
