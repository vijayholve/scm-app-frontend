import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'rollNo', header: 'Roll No' },
  { key: 'userName', header: 'User Name' },
  { key: 'firstName', header: 'First Name' },
  { key: 'lastName', header: 'Last Name' },
  { key: 'email', header: 'Email' },
  { key: 'mobile', header: 'Mobile' },
  { key: 'schoolName', header: 'School' },
  { key: 'className', header: 'Class' },
  { key: 'divisionName', header: 'Division' },
];

const transformAttendanceData = (attendance: any) => ({
  ...atten,
  rollno: atten.rollNo || atten.id,
  name: `${atten.firstName || ''} ${atten.lastName || ''}`.trim() || atten.userName,
  schoolName: atten.school?.name || 'N/A',
  className: atten.class?.name || 'N/A',
  divisionName: atten.division?.name || 'N/A',
});

export const AttenList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/attens/getAllBy/${accountId}`);
      }
    };
    initialize();
  }, []);

  if (!fetchUrl) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title="Attens"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddAtten"
        editUrl="EditAtten"
        deleteUrl="/api/users/delete"
        entityName="Atten"
        searchPlaceholder="Search attens..."
        transformData={transformAttenData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AttenList;
