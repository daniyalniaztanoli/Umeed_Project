import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Users() {
  return <ListScreen title="Users" endpoint="/users" itemTitle="name" />;
}
