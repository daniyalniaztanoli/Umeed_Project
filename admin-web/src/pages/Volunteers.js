import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Volunteers() {
  return <ListScreen title="Volunteers" endpoint="/volunteers" itemTitle="name" />;
}
