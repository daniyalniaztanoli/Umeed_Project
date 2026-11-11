import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function ImpactStories() {
  return <ListScreen title="Impact Stories" endpoint="/impact-stories" itemTitle="title" />;
}
