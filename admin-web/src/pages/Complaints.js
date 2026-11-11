import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Complaints() {
  return <ListScreen title="Complaints" endpoint="/complaints" itemTitle="title" />;
}
