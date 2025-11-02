import React, { useEffect, useState, useMemo, memo } from 'react';
import {
  // We cannot import from 'react-native' in this environment,
  // so we use standard web elements (div, span, button) and
  // inline the Modal/List logic.
  // The React Native code structure is preserved as much as possible.
} from 'react';
import 

// --- UTILITIES TO REPLACE RN CONCEPTS ---
const StyleSheet = {
    create: (styles) => styles,
};
const Dimensions = {
    get: () => ({ width: window.innerWidth, height: window.innerHeight }),
};
const Alert = {
    alert: (title, message) => console.log(`ALERT: ${title} - ${message}`), // Replaced with console log
};

// --- MOCK DATA (SIMULATING EXTERNAL API RESPONSE) ---
// In a real application, this data would come from a `fetch` or Axios call.


/*
 * SCDSelector usage (inside Formik render, assuming a Formik shape):
 * <SCDSelector formik={{ values, setFieldValue, touched, errors }} />
 */
const SCDSelector = ({ formik, showSchool = true, showClass = true, showDivision = true }) => {
  // Mocking Formik structure since we cannot import it in this environment
  const { values, setFieldValue, touched = {}, errors = {} } = formik;
  const { schools = [], classes = [], divisions = [], loading } = useSCDData();
  const currentUser = userDetails.getUser();
  const isTeacher = String(currentUser?.type || '').toUpperCase() === 'TEACHER';
  const teacherSchoolId = currentUser?.schoolId ?? null;
  const teacherAllocatedClasses = useMemo(() => currentUser?.allocatedClasses || [], [currentUser?.allocatedClasses]);

  // helpers to normalize id fields
  const getClassIdFrom = (item) => item?.id ?? item?.schoolClassId ?? item?.classId ?? item?.schoolClass?.id ?? null;
  const getDivisionIdFrom = (item) => item?.id ?? item?.divisionId ?? item?.division?.id ?? null;
  const getDivisionSchoolKey = (d) => d?.schoolId ?? d?.schoolBranchId ?? d?.schoolbranchId ?? null;

  // Ensure teacher's schoolId is always set in formik (and not editable)
  useEffect(() => {
    if (isTeacher && teacherSchoolId != null && values?.schoolId !== teacherSchoolId) {
      setFieldValue('schoolId', teacherSchoolId);
      // clear dependent fields if any mismatch
      setFieldValue('classId', '');
      setFieldValue('divisionId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher, teacherSchoolId]);

  const currentSchoolId = isTeacher ? teacherSchoolId : values?.schoolId;

  const filteredClasses = useMemo(() => {
    if (!Array.isArray(classes)) {
      return [];
    }

    // For teachers, only show allocated classes
    if (isTeacher && teacherAllocatedClasses.length > 0) {
      const allocatedClassIds = teacherAllocatedClasses.map((ac) => ac.classId);
      return classes.filter((c) => {
        const classId = getClassIdFrom(c);
        return allocatedClassIds.includes(classId);
      });
    }

    // For non-teachers, filter by school as before
    return classes.filter((c) => {
      const schoolKey = c.schoolbranchId ?? c.schoolBranchId ?? c.schoolId ?? c.branchId ?? null;
      // If no school is selected for non-teacher, show all classes
      return currentSchoolId ? String(schoolKey) === String(currentSchoolId) : true;
    });
  }, [classes, currentSchoolId, isTeacher, teacherAllocatedClasses]);

  const filteredDivisions = useMemo(() => {
    if (!Array.isArray(divisions)) {
      return [];
    }

    // For teachers, only show divisions from allocated classes
    if (isTeacher && teacherAllocatedClasses.length > 0) {
      const allocatedDivisionIds = teacherAllocatedClasses.map((ac) => ac.divisionId);
      return divisions.filter((d) => {
        const divisionId = getDivisionIdFrom(d);
        return allocatedDivisionIds.includes(divisionId);
      });
    }

    // For non-teachers, filter by school as before
    if (currentSchoolId) {
      return divisions.filter((d) => {
        const schoolKey = getDivisionSchoolKey(d);
        return schoolKey ? String(schoolKey) === String(currentSchoolId) : true;
      });
    }
    // No school selected -> return all divisions
    return divisions;
  }, [divisions, currentSchoolId, isTeacher, teacherAllocatedClasses]);

  // Early return check (converted to native Alert/log)
  if (!formik || typeof formik.setFieldValue !== 'function') {
    Alert.alert('Error', 'SCDSelector requires a formik prop with setFieldValue and values');
    console.error('SCDSelector requires a formik prop with setFieldValue and values');
    return null;
  }

  // --- Handlers use the item object directly now, matching the DropdownSelect structure ---

  const handleSchoolChange = (newValue) => {
    const id = newValue?.id ?? newValue?.schoolbranchId ?? newValue?.schoolId ?? null;
    setFieldValue('schoolId', id);
    setFieldValue('classId', '');
    setFieldValue('divisionId', '');
  };

  const handleClassChange = (newValue) => {
    const id = getClassIdFrom(newValue);
    setFieldValue('classId', id);
    // Do NOT clear divisions here — user might want to pick a division that isn't strictly linked
    // setFieldValue('divisionId', '');
  };

  const handleDivisionChange = (newValue) => {
    const id = getDivisionIdFrom(newValue);
    setFieldValue('divisionId', id);
  };

  // value selectors that match against multiple possible id fields
  const schoolValue = (schools || []).find((s) => String(s.id) === String(values?.schoolId)) || null;
  const classValue = (filteredClasses || []).find((c) => String(getClassIdFrom(c)) === String(values?.classId)) || null;
  const divisionValue = (filteredDivisions || []).find((d) => String(getDivisionIdFrom(d)) === String(values?.divisionId)) || null;

  // Enable division selector when a school OR class is selected (teachers have school prefilled)
  const divisionDisabled = loading || (!isTeacher && !values?.schoolId && !values?.classId);

  // Determine the display name for the disabled teacher's school field
  const teacherSchoolName = schools.find((s) => String(s.id) === String(teacherSchoolId))?.name || 'Loading School...';

  return (
    <div style={styles.container}>
      {/* Show a loading indicator if data is being fetched */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <span style={styles.loadingText}>Loading School, Class, and Division Data...</span>
        </div>
      )}
      
      {/* School: hidden for teachers (teacher's school enforced via effect) */}
      {!isTeacher && showSchool && (
        <DropdownSelect
          label="School"
          value={schoolValue}
          options={schools}
          getOptionLabel={(option) => option?.name || 'N/A'}
          onChange={handleSchoolChange}
          disabled={loading}
          errorText={touched?.schoolId && errors?.schoolId ? errors.schoolId : null}
        />
      )}

      {/* If teacher, optionally show a disabled display of school */}
      {isTeacher && false && (
        <div style={styles.inputContainer}>
          <span style={styles.label}>School (Fixed)</span>
          <input
            style={{...styles.input, ...styles.disabledInput}}
            value={teacherSchoolName}
            disabled={true}
          />
        </div>
      )}

      {showClass && (
        <DropdownSelect
          label="Class"
          value={classValue}
          options={filteredClasses}
          getOptionLabel={(option) => option?.name || 'N/A'}
          onChange={handleClassChange}
          disabled={loading || (!isTeacher && !values?.schoolId)}
          errorText={touched?.classId && errors?.classId ? errors.classId : null}
        />
      )}

      {showDivision && (
        <DropdownSelect
          label="Division"
          value={divisionValue}
          options={filteredDivisions}
          getOptionLabel={(option) => option?.name || 'N/A'}
          onChange={handleDivisionChange}
          disabled={divisionDisabled}
          errorText={touched?.divisionId && errors?.divisionId ? errors.divisionId : null}
        />
      )}
    </div>
  );
};

// Mocking the required PropTypes structure for React Native
const mockFormikShape = {
  values: {},
  setFieldValue: () => {},
  touched: {},
  errors: {}
};

// Default export for the component
export default function App() {
  // Mock State for Formik interaction in the demo
  // Teacher User (schoolId 1)
  const [formikValues, setFormikValues] = useState({ schoolId: 1, classId: '', divisionId: '' });

  const setFieldValue = (field, value) => {
    setFormikValues(prev => ({ ...prev, [field]: value }));
  };

  const formikMock = useMemo(() => ({
    values: formikValues,
    setFieldValue: setFieldValue,
    touched: { schoolId: true, classId: true, divisionId: true },
    errors: { schoolId: null, classId: null, divisionId: null },
  }), [formikValues]);

  return (
    <div style={styles.appContainer}>
      {/* SafeAreaView replacement */}
      <span style={styles.header}>SCD Selector (RN Web Compatible Demo)</span>
      <span style={styles.subHeader}>User Type: {userDetails.getUser().type}</span>
      <div style={styles.mockFormContainer}>
        <SCDSelector formik={formikMock} />
      </div>
      <pre style={styles.debugText}>
        Current Values: {JSON.stringify(formikValues, null, 2)}
      </pre>
    </div>
  );
}

// --- STYLESHEET ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
    display: 'block',
  },
  subHeader: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    display: 'block',
  },
  mockFormContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexDirection: 'column',
    display: 'flex',
    position: 'relative', // for loading overlay
  },
  inputContainer: {
    marginBottom: 20,
    flexDirection: 'column',
    display: 'flex',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    fontWeight: '600',
    display: 'block',
  },
  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    outline: 'none',
  },
  touchableArea: {
    border: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fee2e2',
  },
  disabledInput: {
    backgroundColor: '#e5e7eb',
    cursor: 'default',
  },
  valueText: {
    fontSize: 16,
    color: '#1f2937',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    pointerEvents: 'none', // Allow clicks to pass through to the button
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    display: 'block',
  },
  debugText: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0f766e',
    overflowX: 'auto',
  },
  // Loading Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backdropFilter: 'blur(2px)',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  // Modal Styles (using CSS Fixed Positioning for web compatibility)
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f9fafb',
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    borderBottom: '1px solid #e5e7eb',
    color: '#1f2937',
    display: 'block',
    textAlign: 'center',
  },
  flatListReplacement: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: 0,
  },
  optionItem: {
    padding: 16,
    backgroundColor: '#fff',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    borderTop: '1px solid #f3f4f6', // Separator implementation
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalCloseButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 2px 4px rgba(30, 58, 138, 0.4)',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
