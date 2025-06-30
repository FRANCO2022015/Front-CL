import React from 'react';

type HelloProps = {
  name: string;
};

const Hello: React.FC<HelloProps> = ({ name }) => {
  return <h2>Hola, {name} 👋</h2>;
};

export default Hello;
