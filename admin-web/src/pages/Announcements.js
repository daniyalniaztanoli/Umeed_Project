import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Announcements() {
  return <ListScreen title="Announcements" endpoint="/announcements" itemTitle="title" />;
}
