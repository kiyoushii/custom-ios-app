import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Smile, Frown, Meh, AlertTriangle, Zap, Trash2, Calendar } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';
import { Storage, JournalEntry } from '@/utils/storage';

const MOODS = [
  { type: 'happy', icon: Smile, label: 'Отлично', color: '#10B981', emoji: '😊' },
  { type: 'neutral', icon: Meh, label: 'Нормально', color: '#F59E0B', emoji: '😐' },
  { type: 'sad', icon: Frown, label: 'Грустно', color: '#3B82F6', emoji: '😢' },
  { type: 'stressed', icon: AlertTriangle, label: 'Стресс', color: '#EF4444', emoji: '🤯' },
  { type: 'excited', icon: Zap, label: 'Энергично', color: '#8B5CF6', emoji: '🔥' },
] as const;

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('none');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const loaded = await Storage.getJournalEntries();
    setEntries(loaded);
    
    // If there is an entry for today, prefill it
    const today = new Date().toISOString().split('T')[0];
    if (loaded[today]) {
      setContent(loaded[today].content);
      setSelectedMood(loaded[today].mood);
    }
  };

  const handleSaveEntry = async () => {
    if (!content.trim()) {
      Alert.alert('Ошибка', 'Напишите что-нибудь, прежде чем сохранить.');
      return;
    }

    const updatedEntries = {
      ...entries,
      [selectedDate]: {
        date: selectedDate,
        content: content.trim(),
        mood: selectedMood,
        createdAt: entries[selectedDate]?.createdAt || new Date().toISOString(),
      },
    };

    setEntries(updatedEntries);
    await Storage.saveJournalEntries(updatedEntries);
    Alert.alert('Успех', 'Запись сохранена!');
  };

  const handleDeleteEntry = async (date: string) => {
    Alert.alert('Удалить запись', 'Вы уверены, что хотите удалить эту запись дневника?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const updated = { ...entries };
          delete updated[date];
          setEntries(updated);
          await Storage.saveJournalEntries(updated);
          
          if (date === selectedDate) {
            setContent('');
            setSelectedMood('none');
          }
        },
      },
    ]);
  };

  // Convert entries object to sorted array for list
  const entryList = Object.values(entries).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* NEW ENTRY SECTION */}
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.cardHeader}>
            <Calendar color={theme.textSecondary} size={18} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Запись на сегодня ({selectedDate})
            </Text>
          </View>

          {/* MOOD PICKER */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Как ты себя чувствуешь?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => {
              const isSelected = selectedMood === m.type;
              const MoodIcon = m.icon;
              return (
                <TouchableOpacity
                  key={m.type}
                  style={[
                    styles.moodButton,
                    { borderColor: isSelected ? m.color : theme.backgroundSelected },
                    isSelected && { backgroundColor: `${m.color}15` },
                  ]}
                  onPress={() => setSelectedMood(m.type)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: isSelected ? m.color : theme.textSecondary }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TEXT AREA */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Твои мысли, события, эмоции:</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                color: theme.text,
                borderColor: theme.backgroundSelected,
                backgroundColor: colorScheme === 'dark' ? '#1A1B1E' : '#FFFFFF',
              },
            ]}
            multiline
            numberOfLines={6}
            placeholder="Опиши свой день..."
            placeholderTextColor={theme.textSecondary}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEntry}>
            <Text style={styles.saveBtnText}>Сохранить день</Text>
          </TouchableOpacity>
        </View>

        {/* TIMELINE SECTION */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Архив твоих дней</Text>

        {entryList.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
            <BookOpen color={theme.textSecondary} size={32} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Пока нет записей. Напиши свою первую мысль выше!
            </Text>
          </View>
        ) : (
          entryList.map(item => {
            const moodObj = MOODS.find(m => m.type === item.mood);
            return (
              <View key={item.date} style={[styles.timelineCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineMeta}>
                    <Text style={styles.timelineDate}>{item.date}</Text>
                    {moodObj && (
                      <View style={[styles.moodBadge, { backgroundColor: `${moodObj.color}15`, borderColor: moodObj.color }]}>
                        <Text style={[styles.moodBadgeText, { color: moodObj.color }]}>
                          {moodObj.emoji} {moodObj.label}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteEntry(item.date)} style={styles.deleteBtn}>
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.timelineContent, { color: theme.text }]}>
                  {item.content}
                </Text>
              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  moodButton: {
    flex: 1,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 120,
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.two,
  },
  emptyBox: {
    borderRadius: 16,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timelineCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
    paddingBottom: Spacing.one,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  moodBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  moodBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: Spacing.half,
  },
});
