import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function Feedback() {
  return <ListScreen title="Feedback" endpoint="/feedback" itemTitle="title" />;
}
