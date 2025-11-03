import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, List, Chip, Snackbar, HelperText, Divider, Card } from 'react-native-paper';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { Assignment, Submission } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
// NOTE: For file picking, you need an external library like 'expo-document-picker'. 
// Ensure it is installed and configured in your project.
import * as DocumentPicker from 'expo-document-picker';

type AssignmentForm = Partial<Omit<Assignment, 'submissions'>> & {
  name: string; 
  schoolId: string;
  classId: string;
  divisionId: string;
  subjectId: string;
  message: string; 
  deadLine: string;
  status: string;
  assignmentSubmission: any[]; // Teacher's uploaded assignment files
};

export const EditAssignment: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const assignmentId = (route.params as { id?: string | null })?.id; 
  const { user } = useAuth();
  const isStudent = user?.type === 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Dropdown data
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Assignment Data
  const [form, setForm] = useState<AssignmentForm>({
    name: '',
    schoolId: '',
    classId: '',
    divisionId: '',
    subjectId: '',
    deadLine: '',
    message: '',
    status: 'ACTIVE', 
    assignmentSubmission: [], 
  });

  // Submission Data (For both student and teacher views)
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  // File for new assignment attachment (Teacher/Admin)
  const [uploadedAssignmentFile, setUploadedAssignmentFile] = useState<any | null>(null);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const isTeacherOrAdmin = useMemo(() => user?.type !== 'STUDENT', [user]);

  // --- 1. Fetch Initial Data (SCD, Subjects, Assignment) ---
  const fetchSubmissions = async (id: string, accId?: string | null) => {
    setSaving(true);
    try {
        const studentId = user?.type === 'STUDENT' ? user.id : undefined;
        // In student mode, the API should return only their submission.
        // The mock type definition for Assignment Submission has studentId, fileUrl, grade, remarks, submittedAt.
        const res = await apiService.getAssignmentSubmissions(id, studentId);
        
        // Map: ensure a 'file' property exists for temporary upload selection
        const mappedSubmissions = res.map((sub: any) => ({ ...sub, file: null, message: sub.message || '' }));
        setSubmissions(mappedSubmissions);
    } catch (e) {
        console.error('Failed to fetch submissions:', e);
        showToast('Failed to fetch submissions.');
    } finally {
        setSaving(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      let accId: string | null = null;
      try {
        const raw = await storage.getItem('SCM-AUTH');
        accId = raw ? JSON.parse(raw)?.data?.accountId : null;
        setAccountId(accId);

        if (accId) {
          const [schoolsRes, classesRes, divisionsRes, subjectsRes] = await Promise.all([
            apiService.getSchools(accId),
            apiService.getClassesList(accId),
            apiService.getDivisions(accId),
            apiService.getSubjects(accId),
          ]);
          setSchools(schoolsRes);
          setClasses(classesRes);
          setDivisions(divisionsRes);
          setSubjects(subjectsRes);
        }

        if (assignmentId) {
          const assignmentRes = await apiService.getAssignmentById(assignmentId);
          if (assignmentRes) {
            setForm({
              name: assignmentRes.name || assignmentRes.title || '',
              schoolId: String(assignmentRes.schoolId || ''),
              classId: String(assignmentRes.classId || ''),
              divisionId: String(assignmentRes.divisionId || ''),
              subjectId: String(assignmentRes.subjectId || ''),
              deadLine: assignmentRes.deadLine || assignmentRes.dueDate || '',
              message: assignmentRes.message || assignmentRes.description || '',
              status: assignmentRes.status || 'ACTIVE',
              assignmentSubmission: Array.isArray(assignmentRes.assignmentSubmission) ? assignmentRes.assignmentSubmission : [],
            });
            await fetchSubmissions(assignmentId, accId);
          }
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
        showToast('Failed to load assignment data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [assignmentId, user?.id, user?.type]);

  // --- 2. Form Handlers (Teacher/Admin Assignment CRUD) ---
  const handleSaveAssignment = async () => {
    if (!accountId || isStudent) return;

    if (!form.name || !form.schoolId || !form.classId || !form.divisionId || !form.subjectId || !form.deadLine) {
        showToast('Please fill all required fields.');
        return;
    }
    
    setSaving(true);
    try {
      const payload = {
        id: assignmentId,
        accountId: accountId,
        name: form.name,
        message: form.message,
        schoolId: form.schoolId,
        classId: form.classId,
        divisionId: form.divisionId,
        subjectId: form.subjectId,
        deadLine: form.deadLine,
        status: form.status,
      };

      await apiService.saveAssignment(payload, uploadedAssignmentFile);
      
      showToast(assignmentId ? 'Assignment updated successfully' : 'Assignment created successfully');
      navigation.goBack();

    } catch (error) {
      console.error('Failed to save assignment:', error);
      showToast('Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  // --- 3. Submission Handlers (Student/Teacher) ---
  const handleDownload = async (submissionFile: any, isStudentSubmission: boolean) => {
    Alert.alert(
      'File Download Warning',
      'The actual file download and saving to the device filesystem must be implemented using a dedicated RN library (e.g., react-native-fs or expo-file-system). The API endpoint will be hit, but the resulting blob needs saving logic.'
    );
    // In a real implementation, you would:
    /* try {
      const url = isStudentSubmission ? 
        `/api/assignments/download/file/${submissionFile.id}?assignmentId=${submissionFile.assignmentId}&fileName=${encodeURIComponent(submissionFile.fileName)}` :
        `/api/assignments/download/file/${submissionFile.id}?assignmentId=${assignmentId}&fileName=${encodeURIComponent(submissionFile.fileName)}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      // Call RN file system library to save the blob (response.data)
      showToast('File download triggered.');
    } catch (error) {
      showToast('Failed to download file.');
    } 
    */
  };

  const handlePickStudentSubmission = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        
        // Map picked file format to something compatible with FormData
        const file = {
            uri: pickedFile.uri,
            name: pickedFile.name,
            type: pickedFile.mimeType || 'application/octet-stream',
        };

        setSubmissions((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], file }; 
          return updated;
        });
      }
    } catch (e) {
      console.error('File pick error:', e);
      showToast('Error picking file.');
    }
  };
  
  const handleSubmitStudentWork = async (index: number) => {
    const submissionRecord = submissions[index];
    if (!submissionRecord.file) {
      showToast('Please select a file to submit.');
      return;
    }
    if (!assignmentId || !user?.id) return;
    
    setSaving(true);
    try {
        await apiService.submitAssignment(assignmentId, user.id, submissionRecord.file);
        showToast('Assignment submitted successfully!');
        await fetchSubmissions(assignmentId, accountId); 
    } catch (e) {
        console.error('Submission failed:', e);
        showToast('Failed to submit assignment.');
    } finally {
        setSaving(false);
    }
  };

  const handleTeacherUpdateSubmission = async (index: number) => {
    const submission = submissions[index];
    if (!submission.id) return;
    
    setSaving(true);
    try {
        const payload = {
            status: submission.status,
            message: submission.message
        };
        await apiService.updateAssignmentSubmission(submission.id, payload);
        showToast('Submission feedback updated successfully!');
    } catch (e) {
        console.error('Feedback update failed:', e);
        showToast('Failed to update submission feedback.');
    } finally {
        setSaving(false);
    }
  };
  
  const handleTeacherDeleteSubmission = async (id: string) => {
    if (!id) return;
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this student submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setSaving(true);
            try {
                await apiService.deleteAssignmentSubmission(id);
                showToast('Submission deleted successfully.');
                setSubmissions(prev => prev.filter(sub => sub.id !== id)); 
            } catch (e) {
                console.error('Delete failed:', e);
                showToast('Failed to delete submission.');
            } finally {
                setSaving(false);
            }
          }
        },
      ]
    );
  };

  // --- 4. Render Logic ---
  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  const Title = assignmentId ? 'Edit Assignment' : 'Add Assignment';
  const displayAssignmentFile = form.assignmentSubmission.length > 0 ? form.assignmentSubmission[0] : null;

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineMedium" style={styles.title}>{Title}</Text>

        {/* --- Section 1: Assignment Details (Teacher/Admin Only) --- */}
        {isTeacherOrAdmin && (
          <Card style={styles.card}>
            <Card.Title title="Assignment Details" />
            <Card.Content>
              <TextInput 
                label="Assignment Name *" 
                value={form.name} 
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} 
                mode="outlined" 
                style={styles.input} 
                disabled={saving}
              />
              <TextInput 
                label="Deadline (YYYY-MM-DD) *" 
                value={form.deadLine} 
                onChangeText={(v) => setForm((f) => ({ ...f, deadLine: v }))} 
                mode="outlined" 
                style={styles.input} 
                disabled={saving}
                placeholder='e.g., 2025-12-31'
              />
              <TextInput 
                label="Message / Description" 
                value={form.message} 
                onChangeText={(v) => setForm((f) => ({ ...f, message: v }))} 
                mode="outlined" 
                style={styles.input} 
                multiline
                disabled={saving}
              />

              {/* SCD Selectors (Simplified using List.Accordion) */}
              <List.Section title="Target Class *">
                <List.Accordion title={schools.find((s) => String(s.id) === String(form.schoolId))?.name || 'Select School'}>
                    {schools.map((s) => (
                        <List.Item key={s.id} title={s.name} onPress={() => setForm((f) => ({ ...f, schoolId: String(s.id) }))} />
                    ))}
                </List.Accordion>
                <List.Accordion title={classes.find((c) => String(c.id) === String(form.classId))?.name || 'Select Class'}>
                    {classes.map((c) => (
                        <List.Item key={c.id} title={c.name} onPress={() => setForm((f) => ({ ...f, classId: String(c.id) }))} />
                    ))}
                </List.Accordion>
                <List.Accordion title={divisions.find((d) => String(d.id) === String(form.divisionId))?.name || 'Select Division'}>
                    {divisions.map((d) => (
                        <List.Item key={d.id} title={d.name} onPress={() => setForm((f) => ({ ...f, divisionId: String(d.id) }))} />
                    ))}
                </List.Accordion>
                <List.Accordion title={subjects.find((s) => String(s.id) === String(form.subjectId))?.name || 'Select Subject'}>
                    {subjects.map((s) => (
                        <List.Item key={s.id} title={s.name} onPress={() => setForm((f) => ({ ...f, subjectId: String(s.id) }))} />
                    ))}
                </List.Accordion>
              </List.Section>
              
              {/* Status Select */}
              <List.Section title="Status">
                <List.Accordion title={form.status || 'Select Status'}>
                    {['ACTIVE', 'INACTIVE'].map((s) => (
                        <List.Item key={s} title={s} onPress={() => setForm((f) => ({ ...f, status: s }))} />
                    ))}
                </List.Accordion>
              </List.Section>
              
              {/* Assignment File Upload (Teacher/Admin) */}
              <View style={styles.fileUploadContainer}>
                <Text style={styles.fileUploadTitle}>📁 Upload Assignment File</Text>
                <Button 
                    mode="outlined" 
                    icon="upload" 
                    onPress={() => Alert.alert('File Picker', 'RN file picking not fully implemented. Use a dedicated library.')}
                    disabled={saving}
                >
                    {uploadedAssignmentFile ? 'Change File' : 'Select File'}
                </Button>
                {uploadedAssignmentFile && <Chip style={{marginTop: 8}}>📎 {uploadedAssignmentFile.name}</Chip>}
                {displayAssignmentFile && !uploadedAssignmentFile && (
                    <Text style={{marginTop: 8}}>Current File: {displayAssignmentFile.fileName}</Text>
                )}
              </View>

              {/* Save / Cancel */}
              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => navigation.goBack()} disabled={saving}>
                  Cancel
                </Button>
                <Button mode="contained" loading={saving} disabled={saving} onPress={handleSaveAssignment} style={{backgroundColor: '#2196F3'}}>
                  Save Assignment
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}


        {/* --- Section 2: Assignment Files & Student Submission --- */}
        {form.assignmentSubmission.length > 0 && (
            <Card style={[styles.card, styles.submissionCard]}>
                <Card.Title title={isStudent ? 'Assignment Files & My Submission' : 'Assignment Files'} />
                <Card.Content>
                    {form.assignmentSubmission.map((sub: any, index: number) => (
                        <View key={index} style={styles.submissionRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.submissionFileName}>{sub.fileName} ({sub.fileSize && (sub.fileSize / 1024).toFixed(2) + ' KB'})</Text>
                            </View>
                            <Button 
                                mode="outlined" 
                                icon="download" 
                                onPress={() => handleDownload(sub, false)}
                                compact
                            >
                                Download
                            </Button>
                            
                            {/* Student Submission UI */}
                            {isStudent && (
                                <View style={styles.studentSubmissionArea}>
                                    <Button
                                        mode="outlined"
                                        icon="file-upload"
                                        onPress={() => handlePickStudentSubmission(index)}
                                        compact
                                        disabled={saving}
                                    >
                                        {submissions[index]?.file ? 'Change' : 'Upload'}
                                    </Button>
                                    <Button
                                        mode="contained"
                                        icon="check"
                                        onPress={() => handleSubmitStudentWork(index)}
                                        compact
                                        disabled={!submissions[index]?.file || saving}
                                        style={{marginLeft: 8, backgroundColor: '#4CAF50'}}
                                    >
                                        Submit
                                    </Button>
                                    {submissions[index]?.file && (
                                        <Text style={styles.fileLabel}>📎 {submissions[index].file.name}</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                    
                </Card.Content>
            </Card>
        )}


        {/* --- Section 3: Submissions Review (Teacher/Student) --- */}
        <Card style={[styles.card, styles.reviewCard]}>
            <Card.Title title={isStudent ? 'My Submission & Teacher Feedback' : `Student Submissions (${submissions.length})`} />
            <Card.Content>
                {submissions.length === 0 ? (
                    <Text style={styles.emptyText}>
                        {isStudent ? "You haven't submitted any work yet." : 'No student submissions found.'}
                    </Text>
                ) : (
                    submissions.map((sub: any, index: number) => (
                        <View key={sub.id || index} style={styles.submissionReviewItem}>
                            <View style={styles.reviewHeader}>
                                {!isStudent && (
                                    <Text variant="titleMedium" style={{marginRight: 10}}>👤 Student ID: {sub.studentId}</Text>
                                )}
                                <Chip 
                                    icon={sub.status === 'accepted' ? 'check-circle' : sub.status === 'rejected' ? 'close-circle' : 'progress-alert'}
                                    style={{
                                        backgroundColor: sub.status === 'accepted' ? '#e8f5e9' : sub.status === 'rejected' ? '#ffebee' : '#fbe9e7',
                                        borderColor: sub.status === 'accepted' ? '#4CAF50' : sub.status === 'rejected' ? '#d32f2f' : '#FF9800',
                                        borderWidth: 1,
                                    }}
                                >
                                    {sub.status || 'Pending'}
                                </Chip>
                            </View>
                            
                            <View style={{...styles.submissionRow, marginTop: 8}}>
                                <Text style={{flex: 1}}>📄 Submitted File: {sub.fileName || 'N/A'}</Text>
                                <Button mode="outlined" icon="download" onPress={() => sub.fileName && handleDownload(sub, true)} size="small" disabled={!sub.fileName}>
                                    Download
                                </Button>
                            </View>
                            
                            <HelperText type="info">Submitted: {sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : 'N/A'}</HelperText>

                            {/* Teacher Feedback / Student View */}
                            <View style={{marginTop: 12}}>
                                <Text style={styles.feedbackTitle}>{isStudent ? "Teacher's Feedback" : "Comment & Grade"}</Text>
                                {isStudent ? (
                                    <Text style={styles.feedbackText}>{sub.message || 'No feedback yet'}</Text>
                                ) : (
                                    <View style={styles.teacherActions}>
                                        <TextInput
                                            label="Feedback Message"
                                            value={sub.message || ''}
                                            onChangeText={(v) => setSubmissions((prev) => {
                                                const updated = [...prev];
                                                updated[index].message = v;
                                                return updated;
                                            })}
                                            mode="outlined"
                                            style={{ flex: 1, marginRight: 8, marginBottom: 8 }}
                                        />
                                        <View style={styles.actions}>
                                            <Button 
                                                mode={sub.status === 'accepted' ? 'contained' : 'outlined'}
                                                icon="check"
                                                onPress={() => setSubmissions((prev) => {
                                                    const updated = [...prev];
                                                    updated[index].status = 'accepted';
                                                    return updated;
                                                })}
                                                compact
                                                style={{backgroundColor: sub.status === 'accepted' ? '#4CAF50' : undefined}}
                                            >
                                                Accept
                                            </Button>
                                            <Button 
                                                mode={sub.status === 'rejected' ? 'contained' : 'outlined'}
                                                icon="close"
                                                onPress={() => setSubmissions((prev) => {
                                                    const updated = [...prev];
                                                    updated[index].status = 'rejected';
                                                    return updated;
                                                })}
                                                compact
                                                style={{backgroundColor: sub.status === 'rejected' ? '#d32f2f' : undefined}}
                                            >
                                                Reject
                                            </Button>
                                            <Button 
                                                mode="contained" 
                                                icon="content-save" 
                                                onPress={() => handleTeacherUpdateSubmission(index)}
                                                compact
                                                disabled={saving}
                                                style={{backgroundColor: '#2196F3'}}
                                            >
                                                Save
                                            </Button>
                                            <Button 
                                                mode="text" 
                                                icon="delete" 
                                                textColor="red"
                                                onPress={() => handleTeacherDeleteSubmission(sub.id)}
                                                compact
                                                disabled={saving}
                                            >
                                                Delete
                                            </Button>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <Divider style={styles.submissionDivider} />
                        </View>
                    ))
                )}
            </Card.Content>
        </Card>

      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  submissionCard: {
    backgroundColor: '#e3f2fd', // Light blue
  },
  reviewCard: {
    backgroundColor: '#fff3e0', // Light orange
  },
  input: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  fileUploadContainer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2196F3',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'flex-start',
  },
  fileUploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  submissionFileName: {
    flexShrink: 1,
    fontSize: 14,
    marginRight: 8,
  },
  studentSubmissionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  fileLabel: {
    fontSize: 12,
    marginLeft: 8,
    color: '#666',
  },
  submissionReviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
    color: '#333',
  },
  feedbackText: {
    color: '#666',
  },
  teacherActions: {
    flexDirection: 'column', 
    marginTop: 8,
  },
  submissionDivider: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
  },
  snackbar: {
    marginBottom: Platform.OS === 'ios' ? 30 : 0, 
    backgroundColor: '#2196F3',
  }
});

export default EditAssignment;