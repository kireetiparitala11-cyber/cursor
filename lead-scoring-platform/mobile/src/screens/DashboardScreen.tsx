import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useQuery } from 'react-query';
import { analyticsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { connected } = useSocket();

  const { data: analytics, isLoading, error, refetch } = useQuery(
    'dashboard-analytics',
    () => analyticsApi.getDashboard().then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const onRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard data</Text>
        <FAB
          icon="refresh"
          style={styles.refreshButton}
          onPress={onRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: connected ? '#10b981' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {connected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                {analytics?.overview.totalLeads.toLocaleString() || 0}
              </Title>
              <Paragraph style={styles.statLabel}>Total Leads</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                {analytics?.overview.activeCampaigns.toLocaleString() || 0}
              </Title>
              <Paragraph style={styles.statLabel}>Active Campaigns</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                {analytics?.overview.avgScore || 0}%
              </Title>
              <Paragraph style={styles.statLabel}>Avg Score</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                {analytics?.conversions.conversionRate || 0}%
              </Title>
              <Paragraph style={styles.statLabel}>Conversion Rate</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Leads */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Leads</Title>
            {analytics?.recentLeads && analytics.recentLeads.length > 0 ? (
              analytics.recentLeads.slice(0, 5).map((lead, index) => (
                <View key={lead._id} style={styles.leadItem}>
                  <View style={styles.leadInfo}>
                    <Text style={styles.leadName}>
                      {lead.firstName} {lead.lastName}
                    </Text>
                    <Text style={styles.leadEmail}>{lead.email}</Text>
                  </View>
                  <View style={styles.leadScore}>
                    <Text style={styles.scoreText}>{lead.score.current}%</Text>
                  </View>
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>No recent leads</Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Top Campaigns */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Top Campaigns</Title>
            {analytics?.topCampaigns && analytics.topCampaigns.length > 0 ? (
              analytics.topCampaigns.slice(0, 3).map((campaign, index) => (
                <View key={index} style={styles.campaignItem}>
                  <View style={styles.campaignInfo}>
                    <Text style={styles.campaignName}>
                      {campaign.campaignName}
                    </Text>
                    <Text style={styles.campaignPlatform}>
                      {campaign.platform}
                    </Text>
                  </View>
                  <View style={styles.campaignStats}>
                    <Text style={styles.campaignLeads}>
                      {campaign.leadCount} leads
                    </Text>
                    <Text style={styles.campaignScore}>
                      {campaign.avgScore}% avg
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Paragraph style={styles.emptyText}>No campaigns yet</Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to add lead screen
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  leadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  leadEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  leadScore: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  campaignItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  campaignPlatform: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  campaignStats: {
    alignItems: 'flex-end',
  },
  campaignLeads: {
    fontSize: 14,
    color: '#0f172a',
  },
  campaignScore: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
  },
});

export default DashboardScreen;