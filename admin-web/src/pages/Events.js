import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Events() {
  return <ListScreen title="Events" endpoint="/events" itemTitle="title" />;
}
