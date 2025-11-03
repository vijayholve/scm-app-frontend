import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Portal,
  Modal,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { ReusableList } from '../../../components/ReusableList';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { Assignment } from '../../../types';
import EditAssignment from './EditAssignment';
import AssignmentView from './AssignmentView';

export const AssignmentList: React.FC = () => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [toast, setToast] = useState<string>('');
  const [listKey, setListKey] = useState(0); // Key to force ReusableList refresh

  // Fetch School/Class/Division data for filters
  useEffect(() => {
    const init = async () => {
      const raw = await storage.getItem('SCM-AUTH');
      const acc = raw ? JSON.parse(raw)?.data?.accountId : null;
      setAccountId(acc);
      if (acc) {
        const [s, c, d] = await Promise.all([
          apiService.getSchools(acc),
          apiService.getClassesList(acc),
          apiService.getDivisions(acc),
        ]);
        setSchools(s);
        setClasses(c);
        setDivisions(d);
      }
    };
    init();
  }, []);

  const filterDefs = useMemo(() => {
    return [
      {
        key: 'schoolId',
        label: 'School',
        options: schools.map((x) => ({ label: x.name, value: String(x.id) })),
      },
      {
        key: 'classId',
        label: 'Class',
        options: classes.map((x) => ({ label: x.name, value: String(x.id) })),
      },
      {
        key: 'divisionId',
        label: 'Division',
        options: divisions.map((x) => ({ label: x.name, value: String(x.id) })),
      },
    ];
  }, [schools, classes, divisions]);

  // Fetch function for ReusableList
  const onFetch = async ({ page, size, search, filters }: any) => {
    const acc = accountId || (await storage.getItem('SCM-AUTH').then(raw => raw ? JSON.parse(raw)?.data?.accountId : null));
    if (!acc) return { items: [], total: 0 };
    
    // Use the new paged API service method
    const res = await apiService.getAssignmentsPaged({
      accountId: acc,
      page,
      size,
      search,
      schoolId: filters.schoolId,
      classId: filters.classId,
      divisionId: filters.divisionId,
    });
    return res;
  };

  const onSaved = () => {
    setShowEdit(false);
    setToast('Assignment Saved');
    setListKey(k => k + 1); // Force refresh the list
  };
  
  const openCreate = () => {
    setEditAssignment(null);
    setShowEdit(true);
  };

  const openEdit = (assignment: Assignment) => {
    setEditAssignment(assignment);
    setShowEdit(true);
  };

  const openView = (assignment: Assignment) => {
    setViewAssignment(assignment);
    setShowView(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAssignment(id);
      setToast('Assignment Deleted');
      setListKey(k => k + 1); // Force refresh the list
    } catch (e) {
      setToast('Delete failed');
    }
  };

  // Render function for each item in the list
  const renderItem = (assignment: Assignment) => (
    <Card key={assignment.id} style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleLarge">
              {assignment.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Due: {assignment.dueDate}
            </Text>
          </View>
          <Chip icon="check-all">
            Subs: {assignment.submissions.length}
          </Chip>
        </View>

        <View style={styles.actions}>
          <Button
            mode="text"
            onPress={() => openView(assignment)}
          >
            View
          </Button>
          <Button
            mode="outlined"
            onPress={() => openEdit(assignment)}
          >
            Edit
          </Button>
          <Button
            mode="text"
            textColor="red"
            onPress={() => handleDelete(assignment.id)}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ReusableList<Assignment>
        key={listKey} // Key change forces re-fetch when CRUD actions happen
        filterDefs={filterDefs}
        onFetch={onFetch}
        renderItem={renderItem}
        headerRight={<View />}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openCreate}
      />

      <Portal>
        <Modal
          visible={showEdit}
          onDismiss={() => setShowEdit(false)}
          contentContainerStyle={styles.modal}
        >
          <EditAssignment
            id={editAssignment?.id}
            assignment={editAssignment}
            onClose={() => setShowEdit(false)}
            onSaved={onSaved}
          />
        </Modal>
        <Modal
          visible={showView}
          onDismiss={() => setShowView(false)}
          contentContainerStyle={styles.modal}
        >
          {viewAssignment && <AssignmentView assignment={viewAssignment} />}
        </Modal>
      </Portal>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast('')}
        duration={2000}
      >
        {toast}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
  modal: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    maxHeight: '90%',
  },
});

export default AssignmentList;