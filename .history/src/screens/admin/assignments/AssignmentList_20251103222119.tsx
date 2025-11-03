import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'name' },
  { key: 'subjectName', header: 'User Name' },
  { key: 'firstName', header: 'First Name' },
  { key: 'status', header: 'Last Name' },
  { key: 'deadLine', header: 'Email' },
  { key: 'schoolName', header: 'Mobile' },
  { key: 'schoolName', header: 'School' },
  { key: 'className', header: 'Class' },
  { key: 'divisionName', header: 'Division' },
];

const transformAssignmentData = (assignment: any) => ({
  ...assignment,
  rollno: assignment.rollNo || assignment.id,
  name: `${assignment.firstName || ''} ${assignment.lastName || ''}`.trim() || assignment.userName,
  schoolName: assignment.school?.name || 'N/A',
  className: assignment.class?.name || 'N/A',
  divisionName: assignment.division?.name || 'N/A',
});

export const AssignmentList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/assignments/getAllBy/${accountId}`);
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
        title="Assignments"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddAssignment"
        editUrl="EditAssignment"
        deleteUrl="/api/users/delete"
        entityName="Assignment"
        searchPlaceholder="Search assignments..."
        transformData={transformAssignmentData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AssignmentList;
