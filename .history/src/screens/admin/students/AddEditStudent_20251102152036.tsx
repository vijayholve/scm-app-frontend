import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

// Import ReusableForm and studentFormFields (Assuming these are defined elsewhere)
// import { ReusableForm } from '../../components/common/ReusableForm'; 
// import { studentFormFields } from './studentFormFields'; 

import { ReusableForm } from '../../components/common/ReusableForm';
// Define the route params type
type RouteParams = {
  id?: number | string;
};

export const EditStudent: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // Cast route.params to the defined type and get the id
  const { id } = route.params as RouteParams; 

  const handleCancel = () => {
    // Navigate back to the student list screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ReusableForm
        entityName="Student"
        // 🚨 Pass the ID here! This tells ReusableForm to fetch data.
        entityId={id} 
        fields={studentFormFields}
        // This URL will be used with the entityId to fetch existing data: 
        // /api/users/getById?id={id}
        fetchUrl="/api/users/getById" 
        saveUrl="/api/users/save"
        updateUrl="/api/users/update"
        onSuccessUrl="StudentList"
        
        // Add a cancel button
        cancelButton={
            <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>
                Cancel
            </Button>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cancelButton: {
      marginTop: 10,
  }
});