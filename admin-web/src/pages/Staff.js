import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Staff() {
  return <ListScreen title="Staff" endpoint="/staff" itemTitle="name" />;
}
