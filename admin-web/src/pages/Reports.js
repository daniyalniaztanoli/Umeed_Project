import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Reports() {
  return <ListScreen title="Reports" endpoint="/reports" itemTitle="title" />;
}
