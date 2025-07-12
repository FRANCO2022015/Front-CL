import React from 'react'

type Props = { name: string }

const Hello: React.FC<Props> = ({ name }) => (
  <h1>Bienvenido, {name}</h1>
)

export default Hello
