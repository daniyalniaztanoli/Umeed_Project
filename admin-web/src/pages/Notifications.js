import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Notifications() {
  return <ListScreen title="Notifications" endpoint="/notifications" itemTitle="title" />;
}
