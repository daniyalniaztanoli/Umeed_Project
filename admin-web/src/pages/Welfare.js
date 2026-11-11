import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Welfare() {
  return <ListScreen title="Welfare Requests" endpoint="/welfare" itemTitle="title" />;
}
