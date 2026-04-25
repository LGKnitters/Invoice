import { useState } from 'react'
import DispatchForm from './components/DispatchForm'
import DispatchSlip from './components/DispatchSlip'
import './App.css'

export default function App() {
  const [formData, setFormData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (data) => { setFormData(data); setIsEditing(false) }
  const handleEdit = () => setIsEditing(true)

  if (!formData || isEditing) {
    return <DispatchForm initialData={formData} onSubmit={handleSubmit} />
  }

  return <DispatchSlip data={formData} onEdit={handleEdit} />
}
