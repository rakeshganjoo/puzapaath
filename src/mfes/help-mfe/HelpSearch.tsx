/**
 * HelpSearch.tsx
 * Search FAQs and help glossary by keyword
 * Real-time filtering with relevance matching
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HELP_FAQ, HELP_GLOSSARY, HELP_GUIDES, getAllSearchableContent } from '../../data/help-glossary';

interface SearchResult {
  id: string;
  type: 'term' | 'guide' | 'faq';
  title: string;
  preview: string;
  category: string;
}

interface HelpSearchProps {
  navigation: any;
}

export default function HelpSearch({ navigation }: HelpSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const allContent = useMemo(() => getAllSearchableContent(), []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();

    const filtered = allContent
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const contentMatch = item.content.toLowerCase().includes(q);
        return titleMatch || contentMatch;
      })
      .map((item) => {
        const preview = item.content.substring(0, 100).replace(/\n/g, ' ') + '...';
        return {
          id: item.id,
          type: item.type,
          title: item.title,
          preview,
          category: item.category,
        };
      })
      .slice(0, 20); // Limit to 20 results

    setResults(filtered);
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'faq') {
      navigation.navigate('HelpFAQDetail', { faqId: result.id });
    } else {
      navigation.navigate('HelpTopicDetail', { guideId: result.id, title: result.title });
    }
  };

  const suggestedSearches = [
    'Tekni',
    'Birth time',
    'Muhurat',
    'Tithi',
    'Puja',
    'Kundali',
    'Lagna',
    'Marriage',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#596273" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help topics, FAQ, terms..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Suggested Searches (when no query) */}
        {!searchQuery && (
          <View style={styles.suggestedSection}>
            <Text style={styles.suggestedTitle}>Popular searches</Text>
            <View style={styles.suggestedGrid}>
              {suggestedSearches.map((search, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestedTag}
                  onPress={() => handleSearch(search)}
                >
                  <Text style={styles.suggestedText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchQuery && results.length > 0 && (
          <View>
            <Text style={styles.resultsCount}>
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </Text>

            {results.map((result, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.resultCard}
                onPress={() => handleResultPress(result)}
                activeOpacity={0.7}
              >
                {/* Type Badge */}
                <View style={[
                  styles.typeBadge,
                  result.type === 'faq' && styles.typeBadgeFAQ,
                  result.type === 'term' && styles.typeBadgeTerm,
                  result.type === 'guide' && styles.typeBadgeGuide,
                ]}>
                  <Text style={styles.typeBadgeText}>
                    {result.type === 'faq' ? 'Q&A' : result.type === 'term' ? 'Term' : 'Guide'}
                  </Text>
                </View>

                {/* Content */}
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <Text style={styles.resultPreview}>{result.preview}</Text>
                  <Text style={styles.resultCategory}>{result.category}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#6A7484" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Results */}
        {searchQuery && results.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search" size={48} color="#CCC" />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsDesc}>
              Try searching for: Tekni, Muhurat, Tithi, Puja, Lagna, or any other topic
            </Text>
          </View>
        )}

        {/* All FAQs Section (when no search) */}
        {!searchQuery && (
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>All FAQs</Text>

            {HELP_FAQ.map((faq, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.faqItemCard}
                onPress={() => navigation.navigate('HelpFAQDetail', { faqId: faq.id })}
                activeOpacity={0.7}
              >
                <View style={styles.faqItemContent}>
                  <Text style={styles.faqItemQuestion}>{faq.question}</Text>
                  <Text style={styles.faqItemCategory}>{faq.category}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6A7484" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },

  // Search Input
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#2D2D3A',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Suggested Searches
  suggestedSection: {
    marginVertical: 20,
  },

  suggestedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 12,
  },

  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  suggestedTag: {
    backgroundColor: '#ECEFF3',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  suggestedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#596273',
  },

  // Results
  resultsCount: {
    fontSize: 13,
    color: '#999',
    marginVertical: 12,
    fontWeight: '500',
  },

  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DEE2E8',
  },

  typeBadge: {
    backgroundColor: '#ECEFF3',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 10,
    marginTop: 2,
  },

  typeBadgeFAQ: {
    backgroundColor: '#FFF0E6',
  },

  typeBadgeTerm: {
    backgroundColor: '#E6F3FF',
  },

  typeBadgeGuide: {
    backgroundColor: '#ECEFF3',
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#596273',
  },

  resultContent: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 4,
  },

  resultPreview: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
    marginBottom: 6,
  },

  resultCategory: {
    fontSize: 11,
    color: '#9A7B4F',
    fontWeight: '500',
  },

  // No Results
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  noResultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D3A',
    marginTop: 12,
  },

  noResultsDesc: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },

  // FAQ Section
  faqSection: {
    marginVertical: 20,
  },

  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 12,
  },

  faqItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DEE2E8',
  },

  faqItemContent: {
    flex: 1,
  },

  faqItemQuestion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D2D3A',
    marginBottom: 4,
    lineHeight: 19,
  },

  faqItemCategory: {
    fontSize: 11,
    color: '#9A7B4F',
    fontWeight: '500',
  },
});
