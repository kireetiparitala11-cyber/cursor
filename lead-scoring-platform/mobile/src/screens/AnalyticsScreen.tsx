import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const AnalyticsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Analytics</Title>
          <Paragraph>
            The analytics dashboard is coming soon. This will include:
          </Paragraph>
          <Paragraph>• Campaign performance analytics</Paragraph>
          <Paragraph>• Lead quality trends and insights</Paragraph>
          <Paragraph>• Conversion funnel analysis</Paragraph>
          <Paragraph>• ROI and cost-per-lead metrics</Paragraph>
          <Paragraph>• Custom reporting and exports</Paragraph>
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

export default AnalyticsScreen;