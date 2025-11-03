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

const transformAttendData = (attend: any) => ({
  ...attend,
  rollno: attend.rollNo || attend.id,
  name: `${attend.firstName || ''} ${attend.lastName || ''}`.trim() || attend.userName,
  schoolName: attend.school?.name || 'N/A',
  className: attend.class?.name || 'N/A',
  divisionName: attend.division?.name || 'N/A',
});

export const AttendList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/attends/getAllBy/${accountId}`);
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
        title="Attends"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddAttend"
        editUrl="EditAttend"
        deleteUrl="/api/users/delete"
        entityName="Attend"
        searchPlaceholder="Search attends..."
        transformData={transformAttendData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AttendList;
