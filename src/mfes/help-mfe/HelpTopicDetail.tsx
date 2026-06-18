/**
 * HelpTopicDetail.tsx
 * Full-content view for individual help guides, glossary terms
 * Simple markdown-like rendering of guide content
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HELP_GUIDES, HELP_GLOSSARY } from '../../data/help-glossary';

interface HelpTopicDetailProps {
  route: any;
  navigation: any;
}

export default function HelpTopicDetail({ route, navigation }: HelpTopicDetailProps) {
  const { guideId, title } = route.params;

  const content = useMemo(() => {
    // Find in guides first
    const guide = HELP_GUIDES.find((g) => g.id === guideId);
    if (guide) {
      return {
        type: 'guide',
        title: guide.title,
        content: guide.content,
        readTime: guide.readTime,
      };
    }

    // Check glossary
    const term = Object.values(HELP_GLOSSARY).find((t) => t.id === guideId);
    if (term) {
      let contentStr = '';

      contentStr += `${term.shortDesc}\n\n`;

      contentStr += `**Full Description**\n${term.fullDesc}\n\n`;

      if (term.whyItMatters) {
        contentStr += `**Why It Matters**\n${term.whyItMatters}\n\n`;
      }

      if (term.examples && term.examples.length > 0) {
        contentStr += `**Examples**\n${term.examples.map((e) => `• ${e}`).join('\n')}\n\n`;
      }

      if (term.learnMore) {
        contentStr += `**Learn More**\n${term.learnMore}`;
      }

      return {
        type: 'term',
        title: term.title,
        content: contentStr,
        readTime: 3, // estimate
      };
    }

    return null;
  }, [guideId]);

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Content not found</Text>
      </SafeAreaView>
    );
  }

  // Parse and render content with basic markdown support
  const renderContent = (text: string) => {
    const parts = text.split('\n\n');

    return parts.map((part, partIdx) => {
      const headingLineMatch = part.match(/^\*\*(.+?)\*\*(?:\n([\s\S]*))?$/);
      if (headingLineMatch) {
        const heading = headingLineMatch[1].trim();
        const remainder = (headingLineMatch[2] || '').replace(/\*\*/g, '').trim();
        return (
          <View key={partIdx}>
            <Text style={styles.heading}>{heading}</Text>
            {remainder ? <Text style={styles.paragraph}>{remainder}</Text> : null}
          </View>
        );
      }

      if (part.startsWith('|')) {
        // Table
        const lines = part.split('\n');
        return (
          <View key={partIdx} style={styles.table}>
            {lines.map((line, lineIdx) => {
              if (line.startsWith('|') && line.includes('---')) return null;

              const cells = line.split('|').filter((c) => c.trim());
              return (
                <View
                  key={lineIdx}
                  style={[
                    styles.tableRow,
                    lineIdx === 0 && styles.tableHeaderRow,
                  ]}
                >
                  {cells.map((cell, cellIdx) => (
                    <Text
                      key={cellIdx}
                      style={[
                        styles.tableCell,
                        lineIdx === 0 && styles.tableCellHeader,
                      ]}
                    >
                      {cell.trim()}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        );
      }

      // Regular paragraphs or bullet lists
      if (part.startsWith('- ') || part.startsWith('• ')) {
        const items = part.split('\n');
        return (
          <View key={partIdx} style={styles.bulletList}>
            {items
              .filter((item) => item.trim())
              .map((item, itemIdx) => {
                const cleanItem = item.replace(/^[•\-]\s*/, '');
                return (
                  <View key={itemIdx} style={styles.bulletItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{cleanItem}</Text>
                  </View>
                );
              })}
          </View>
        );
      }

      if (part.trim()) {
        return (
          <Text key={partIdx} style={styles.paragraph}>
            {part.replace(/\*\*/g, '')}
          </Text>
        );
      }

      return null;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{content.title}</Text>
          <View style={styles.meta}>
            <Ionicons name="book-outline" size={14} color="#6A7484" />
            <Text style={styles.metaText}>{content.readTime} min read</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {renderContent(content.content)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerIconBox}>
            <Ionicons name="bulb-outline" size={20} color="#6A7484" />
          </View>
          <Text style={styles.footerText}>
            Questions? Check the FAQ section or contact us via app Settings.
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

  // Header
  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 8,
    lineHeight: 32,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontSize: 12,
    color: '#6A7484',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Content
  contentContainer: {
    marginBottom: 24,
  },

  paragraph: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    marginBottom: 16,
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D3A',
    marginTop: 16,
    marginBottom: 12,
  },

  // Bullet Lists
  bulletList: {
    marginBottom: 16,
  },

  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  bullet: {
    fontSize: 14,
    color: '#6A7484',
    marginRight: 10,
    fontWeight: '600',
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },

  // Tables
  table: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },

  tableHeaderRow: {
    backgroundColor: '#ECEFF3',
  },

  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: '#333',
  },

  tableCellHeader: {
    fontWeight: '700',
    color: '#596273',
    fontSize: 11,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    backgroundColor: '#ECEFF3',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6A7484',
    marginBottom: 20,
  },

  footerIconBox: {
    marginRight: 12,
  },

  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#5A4A3A',
    lineHeight: 18,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
