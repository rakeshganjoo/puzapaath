/**
 * HelpFAQDetail.tsx
 * Individual FAQ answer view with related terms
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HELP_FAQ, HELP_GLOSSARY } from '../../data/help-glossary';

interface HelpFAQDetailProps {
  route: any;
  navigation: any;
}

export default function HelpFAQDetail({ route, navigation }: HelpFAQDetailProps) {
  const { faqId } = route.params;

  const faq = useMemo(() => {
    return HELP_FAQ.find((f) => f.id === faqId);
  }, [faqId]);

  const relatedTerms = useMemo(() => {
    if (!faq || !faq.relatedTerms) return [];
    return faq.relatedTerms
      .map((termId) => HELP_GLOSSARY[termId])
      .filter((term) => term !== undefined);
  }, [faq]);

  if (!faq) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>FAQ not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.category}>{faq.category}</Text>
          <Text style={styles.question}>{faq.question}</Text>
        </View>

        {/* Answer */}
        <View style={styles.answerSection}>
          <Text style={styles.answerLabel}>Answer</Text>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Terms</Text>
            <View style={styles.relatedGrid}>
              {relatedTerms.map((term) => (
                <TouchableOpacity
                  key={term.id}
                  style={styles.relatedTermCard}
                  onPress={() =>
                    navigation.navigate('HelpTopicDetail', {
                      guideId: term.id,
                      title: term.title,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.relatedTermName}>{term.title}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#596273" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="bulb-outline" size={20} color="#6A7484" />
          <Text style={styles.footerText}>
            Still have questions? Try searching in the Help section or contact us.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },

  scrollView: {
    padding: 16,
  },

  // Question Section
  questionSection: {
    marginBottom: 24,
  },

  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A7B4F',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D3A',
    lineHeight: 28,
  },

  // Answer Section
  answerSection: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DEE2E8',
  },

  answerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#596273',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  answer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
  },

  // Related Terms
  relatedSection: {
    marginBottom: 24,
  },

  relatedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 12,
  },

  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  relatedTermCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF3',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  relatedTermName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#596273',
    marginRight: 6,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#6A7484',
  },

  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#5A4A3A',
    lineHeight: 18,
    marginLeft: 10,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
