import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const CampaignsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Campaign Management</Title>
          <Paragraph>
            The campaign management interface is coming soon. This will include:
          </Paragraph>
          <Paragraph>• Meta Ads and Google Ads integration</Paragraph>
          <Paragraph>• Campaign performance tracking</Paragraph>
          <Paragraph>• Lead source attribution</Paragraph>
          <Paragraph>• Budget and spend monitoring</Paragraph>
          <Paragraph>• Automated lead ingestion</Paragraph>
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

export default CampaignsScreen;