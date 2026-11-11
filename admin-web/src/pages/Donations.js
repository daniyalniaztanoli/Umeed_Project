import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Donations() {
  return <ListScreen title="Donations" endpoint="/donations" itemTitle="title" />;
}
