import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function BankPage() {
  const { slug } = useParams()

  const title = slug
    .split('-')
    .map((part) => part.toUpperCase())
    .join(' ')

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{title}</h1>
      <p>Welcome to the {title} page.</p>
      <Link to="/">Back to all banks</Link>
    </div>
  )
}

