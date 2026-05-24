import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckSquare as LucideCheckSquare, Square as LucideSquare, Plus as LucidePlus, Trash2 as LucideTrash2, Flame as LucideFlame, Award as LucideAward, Calendar as LucideCalendar } from 'lucide-react-native';
const CheckSquare = LucideCheckSquare as any;
const Square = LucideSquare as any;
const Plus = LucidePlus as any;
const Trash2 = LucideTrash2 as any;
const Flame = LucideFlame as any;
const Award = LucideAward as any;
const Calendar = LucideCalendar as any;

import { Colors, Spacing } from '@/constants/theme';
import { Storage, Habit } from '@/utils/storage';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const loaded = await Storage.getHabits();
    setHabits(loaded);
  };

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Ошибка', 'Введите название привычки');
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitName.trim(),
      createdAt: today,
      completedDates: [],
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    await Storage.saveHabits(updated);

    setHabitName('');
    setModalVisible(false);
  };

  const handleToggleHabit = async (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(today);
        let completedDates = [...h.completedDates];
        
        if (isCompleted) {
          completedDates = completedDates.filter(d => d !== today);
        } else {
          completedDates.push(today);
        }
        
        return { ...h, completedDates };
      }
      return h;
    });

    setHabits(updated);
    await Storage.saveHabits(updated);
  };

  const handleDeleteHabit = async (id: string) => {
    Alert.alert('Удалить привычку', 'Вы действительно хотите удалить эту привычку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const updated = habits.filter(h => h.id !== id);
          setHabits(updated);
          await Storage.saveHabits(updated);
        },
      },
    ]);
  };

  // Streak calculator
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const completedSet = new Set(completedDates);
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if habit is completed today or yesterday, if not, current streak is 0
    if (!completedSet.has(today) && !completedSet.has(yesterday)) {
      return 0;
    }
    
    let checkDate = completedSet.has(today) ? today : yesterday;
    let currentStreak = 0;
    
    while (true) {
      if (completedSet.has(checkDate)) {
        currentStreak++;
        // Move back 1 day
        const dateObj = new Date(checkDate);
        dateObj.setDate(dateObj.getDate() - 1);
        checkDate = dateObj.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  // Total completed today
  const completedTodayCount = habits.filter(h => h.completedDates.includes(today)).length;
  const progressPct = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* PROGRESS CARD */}
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.progressInfo}>
            <View>
              <Text style={[styles.progressTitle, { color: theme.text }]}>Прогресс на сегодня</Text>
              <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                Выполнено: {completedTodayCount} из {habits.length}
              </Text>
            </View>
            <View style={styles.pctContainer}>
              <Text style={styles.pctText}>{progressPct}%</Text>
            </View>
          </View>

          <View style={[styles.barBg, { backgroundColor: theme.backgroundSelected }]}>
            <View style={[styles.barFill, { width: `${progressPct}%`, backgroundColor: '#10B981' }]} />
          </View>
        </View>

        {/* BUTTON: ADD HABIT */}
        <TouchableOpacity style={styles.addHabitBtn} onPress={() => setModalVisible(true)}>
          <Plus color="#ffffff" size={18} />
          <Text style={styles.addHabitBtnText}>Добавить новую привычку</Text>
        </TouchableOpacity>

        {/* HABITS LIST */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Мои привычки</Text>

        {habits.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
            <Calendar color={theme.textSecondary} size={32} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Пока нет привычек. Добавьте первую!
            </Text>
          </View>
        ) : (
          habits.map(item => {
            const isCompletedToday = item.completedDates.includes(today);
            const streak = calculateStreak(item.completedDates);
            
            return (
              <View key={item.id} style={[styles.habitCard, { backgroundColor: theme.backgroundElement }]}>
                <TouchableOpacity
                  style={styles.checkboxTouch}
                  onPress={() => handleToggleHabit(item.id)}
                >
                  {isCompletedToday ? (
                    <CheckSquare color="#10B981" size={24} />
                  ) : (
                    <Square color={theme.textSecondary} size={24} />
                  )}
                  
                  <View style={{ flex: 1, marginLeft: Spacing.two }}>
                    <Text style={[
                      styles.habitName,
                      { color: theme.text },
                      isCompletedToday && { textDecorationLine: 'line-through', color: theme.textSecondary }
                    ]}>
                      {item.name}
                    </Text>
                    
                    <View style={styles.streakRow}>
                      <Flame color="#F59E0B" size={14} />
                      <Text style={styles.streakText}>
                        Серия: {streak} {streak === 1 ? 'день' : streak > 1 && streak < 5 ? 'дня' : 'дней'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.habitMeta}>
                  <View style={styles.completionsBadge}>
                    <Award color="#6366F1" size={12} />
                    <Text style={styles.completionsText}>Всего: {item.completedDates.length}</Text>
                  </View>
                  
                  <TouchableOpacity onPress={() => handleDeleteHabit(item.id)} style={styles.deleteBtn}>
                    <Trash2 color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

      </ScrollView>

      {/* MODAL: ADD HABIT */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Новая привычка</Text>

            <TextInput
              placeholder="Название (например: Читать 15 мин)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={habitName}
              onChangeText={setHabitName}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                onPress={() => {
                  setModalVisible(false);
                  setHabitName('');
                }}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: '#10B981' }]}
                onPress={handleAddHabit}
              >
                <Text style={styles.confirmBtnText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  progressCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  pctContainer: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pctText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  addHabitBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addHabitBtnText: {
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: Spacing.three,
  },
  checkboxTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
  },
  habitMeta: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  completionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completionsText: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: Spacing.half,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontWeight: '600',
  },
  confirmBtn: {
    // bg set dynamically
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
