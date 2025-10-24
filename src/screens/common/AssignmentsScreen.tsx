import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Chip } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Assignment } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const AssignmentsScreen: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const filters = user?.role === 'teacher' ? { teacherId: user.id } : undefined;
      const data = await apiService.getAssignments(filters);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAssignment(id);
      loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {assignments.map((assignment) => (
          <Card key={assignment.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">{assignment.title}</Text>
                <Chip icon="calendar">Due: {assignment.dueDate}</Chip>
              </View>

              <Text variant="bodyMedium" style={styles.description}>
                {assignment.description}
              </Text>

              <View style={styles.info}>
                <Text variant="bodySmall">
                  Submissions: {assignment.submissions.length}
                </Text>
                {assignment.attachmentUrl && (
                  <Text variant="bodySmall">📎 Attachment available</Text>
                )}
              </View>

              {hasPermission('EDIT_ASSIGNMENTS') && (
                <View style={styles.actions}>
                  <Button mode="outlined" onPress={() => console.log('Edit', assignment.id)}>
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
              )}

              {user?.role === 'student' && (
                <Button mode="contained" style={styles.submitButton}>
                  Submit Assignment
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}

        {assignments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No assignments found</Text>
          </View>
        )}
      </ScrollView>

      {hasPermission('CREATE_ASSIGNMENTS') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => console.log('Create assignment')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  info: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
