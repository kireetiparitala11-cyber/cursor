import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const LeadsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Leads Management</Title>
          <Paragraph>
            The leads management interface is coming soon. This will include:
          </Paragraph>
          <Paragraph>• Real-time lead stream with filtering</Paragraph>
          <Paragraph>• Advanced lead scoring and prioritization</Paragraph>
          <Paragraph>• Lead assignment and tracking</Paragraph>
          <Paragraph>• Interaction history and notes</Paragraph>
          <Paragraph>• Conversion tracking and analytics</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    elevation: 2,
  },
});

export default LeadsScreen;