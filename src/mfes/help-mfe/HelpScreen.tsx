/**
 * HelpScreen.tsx
 * Main Help & FAQ screen with 6 tabs: Getting Started, Calendar, Tekni, Puja, Muhurat, FAQ
 * Simple, accessible, non-technical explanations for all users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HELP_TOPICS_BY_CATEGORY, HELP_GLOSSARY, HELP_FAQ } from '../../data/help-glossary';

interface HelpScreenProps {
  navigation: any;
}

const TABS = [
  { id: 'getting-started', label: 'Getting Started', icon: 'information-circle' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'tekni', label: 'Tekni', icon: 'pie-chart' },
  { id: 'puja', label: 'Puja', icon: 'heart' },
  { id: 'muhurat', label: 'Muhurat', icon: 'time' },
  { id: 'faq', label: 'FAQ', icon: 'help' },
];

export default function HelpScreen({ navigation }: HelpScreenProps) {
  const [activeTab, setActiveTab] = useState<string>('getting-started');
  const [searchActive, setSearchActive] = useState(false);

  const priorityFaqIds = [
    'faq-how-tithi-is-calculated',
    'faq-how-muhurat-is-decided',
    'faq-why-results-differ',
    'faq-location-impact',
    'faq-midnight-birth',
  ];

  const quickFaqs = [
    ...HELP_FAQ.filter((f) => priorityFaqIds.includes(f.id)),
    ...HELP_FAQ.filter((f) => !priorityFaqIds.includes(f.id)),
  ].slice(0, 6);

  const handleTopicPress = (guideId: string, title: string) => {
    navigation.navigate('HelpTopicDetail', { guideId, title });
  };

  const renderTopicCard = (guideId: string, title: string, readTime: number) => (
    <TouchableOpacity
      key={guideId}
      style={styles.topicCard}
      onPress={() => handleTopicPress(guideId, title)}
      activeOpacity={0.7}
    >
      <View style={styles.topicContent}>
        <Text style={styles.topicTitle}>{title}</Text>
        <View style={styles.topicMeta}>
          <Ionicons name="book-outline" size={14} color="#9A7B4F" />
          <Text style={styles.readTime}>{readTime} min read</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6A7484" />
    </TouchableOpacity>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'getting-started':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Getting Started</Text>
              <Text style={styles.tabDesc}>Learn the basics of Janthari and get up to speed</Text>
            </View>

            {HELP_TOPICS_BY_CATEGORY['Getting Started'].map((guide) =>
              renderTopicCard(guide.id, guide.title, guide.readTime)
            )}

            <View style={styles.helpNote}>
              <Ionicons name="bulb-outline" size={20} color="#9A7B4F" />
              <Text style={styles.helpNoteText}>
                New to Janthari? Start with "Welcome to Janthari" to understand what each feature does.
              </Text>
            </View>
          </ScrollView>
        );

      case 'calendar':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>KP Calendar</Text>
              <Text style={styles.tabDesc}>
                Understanding the lunar calendar, Tithis, and Hindu festivals
              </Text>
            </View>

            {HELP_TOPICS_BY_CATEGORY['Calendar'].map((guide) =>
              renderTopicCard(guide.id, guide.title, guide.readTime)
            )}

            <View style={styles.helpNote}>
              <Ionicons name="moon-outline" size={20} color="#9A7B4F" />
              <Text style={styles.helpNoteText}>
                The Hindu calendar is based on lunar cycles, so festival dates change each year.
              </Text>
            </View>
          </ScrollView>
        );

      case 'tekni':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Tekni (Birth Chart)</Text>
              <Text style={styles.tabDesc}>
                Your astrological profile and how to interpret it
              </Text>
            </View>

            {HELP_TOPICS_BY_CATEGORY['Tekni'].map((guide) =>
              renderTopicCard(guide.id, guide.title, guide.readTime)
            )}

            <View style={styles.helpNote}>
              <Ionicons name="star-outline" size={20} color="#9A7B4F" />
              <Text style={styles.helpNoteText}>
                Your exact birth time (to the minute) is crucial for accurate calculations.
              </Text>
            </View>
          </ScrollView>
        );

      case 'puja':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Puja Rituals</Text>
              <Text style={styles.tabDesc}>
                Learn about rituals, materials, and how to perform Janam Din Puja
              </Text>
            </View>

            {HELP_TOPICS_BY_CATEGORY['Puja'].map((guide) =>
              renderTopicCard(guide.id, guide.title, guide.readTime)
            )}

            <View style={styles.helpNote}>
              <Ionicons name="flower-outline" size={20} color="#9A7B4F" />
              <Text style={styles.helpNoteText}>
                Puja is not just for religious people—it's a ritual of gratitude and intention.
              </Text>
            </View>
          </ScrollView>
        );

      case 'muhurat':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Auspicious Timing (Muhurat)</Text>
              <Text style={styles.tabDesc}>
                Choose the perfect time for important events
              </Text>
            </View>

            {HELP_TOPICS_BY_CATEGORY['Muhurat'].map((guide) =>
              renderTopicCard(guide.id, guide.title, guide.readTime)
            )}

            <View style={styles.helpNote}>
              <Ionicons name="alarm-outline" size={20} color="#9A7B4F" />
              <Text style={styles.helpNoteText}>
                Muhurat is about aligning your plans with favorable planetary positions.
              </Text>
            </View>
          </ScrollView>
        );

      case 'faq':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Frequently Asked Questions</Text>
              <Text style={styles.tabDesc}>Quick answers to common questions</Text>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate('HelpSearch')}
            >
              <Ionicons name="search" size={18} color="#999" />
              <Text style={styles.searchPlaceholder}>Search FAQs...</Text>
            </TouchableOpacity>

            {/* Quick FAQs */}
            {quickFaqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqCard}
                onPress={() => navigation.navigate('HelpFAQDetail', { faqId: faq.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name="chevron-forward" size={18} color="#6C5CE7" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('HelpSearch')}
            >
              <Text style={styles.viewAllText}>View All FAQs & Search</Text>
              <Ionicons name="arrow-forward" size={16} color="#6C5CE7" />
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={activeTab === tab.id ? (tab.icon as any) : `${tab.icon}-outline`}
                size={16}
                  color={activeTab === tab.id ? '#596273' : '#999'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },

  // Tabs
  tabsContainer: {
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E8',
  },

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabButtonActive: {
    borderBottomColor: '#596273',
  },

  tabIcon: {
    marginRight: 6,
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },

  tabLabelActive: {
    color: '#596273',
  },

  // Tab Content
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  tabHeader: {
    marginBottom: 20,
  },

  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 6,
  },

  tabDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Topic Cards
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DEE2E8',
  },

  topicContent: {
    flex: 1,
  },

  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 6,
  },

  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readTime: {
    fontSize: 12,
    color: '#6A7484',
    marginLeft: 6,
  },

  // Help Notes
  helpNote: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF3',
    borderRadius: 12,
    padding: 12,
    marginVertical: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#6A7484',
  },

  helpNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#5A4A3A',
    marginLeft: 10,
    lineHeight: 18,
  },

  // FAQ Cards
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  searchPlaceholder: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },

  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DEE2E8',
  },

  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#2D2D3A',
    lineHeight: 19,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF3',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#596273',
    marginRight: 6,
  },
});
