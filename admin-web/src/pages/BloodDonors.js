import React from 'react';
import { ListScreen } from '../components/ListScreen';
export default function BloodDonors() {
  return <ListScreen title="Blood Donors" endpoint="/blood-donors" itemTitle="name" />;
}
