import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Departments() {
  return <ListScreen title="Departments" endpoint="/departments" itemTitle="name" />;
}
