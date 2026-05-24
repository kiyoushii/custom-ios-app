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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell as LucideDumbbell, Calendar as LucideCalendar, Plus as LucidePlus, Trash2 as LucideTrash2, CheckCircle as LucideCheckCircle, Clock as LucideClock } from 'lucide-react-native';
const Dumbbell = LucideDumbbell as any;
const Calendar = LucideCalendar as any;
const Plus = LucidePlus as any;
const Trash2 = LucideTrash2 as any;
const CheckCircle = LucideCheckCircle as any;
const Clock = LucideClock as any;

import { Colors, Spacing } from '@/constants/theme';
import { Storage, WorkoutSession, WorkoutSplit, ExerciseLog, WorkoutSet } from '@/utils/storage';

export default function WorkoutScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // Tabs: 'new' or 'history'
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // Data State
  const [splits, setSplits] = useState<WorkoutSplit[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // Active Session State
  const [selectedSplit, setSelectedSplit] = useState<WorkoutSplit | null>(null);
  const [activeExercises, setActiveExercises] = useState<ExerciseLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedSplits = await Storage.getWorkoutSplits();
    const loadedHistory = await Storage.getWorkoutSessions();
    setSplits(loadedSplits);
    setHistory(loadedHistory);
  };

  // Start a workout by selecting a split
  const handleSelectSplit = (split: WorkoutSplit) => {
    setSelectedSplit(split);
    // Initialize exercises with 1 empty set each
    const initialExercises: ExerciseLog[] = split.exercises.map(name => ({
      exerciseName: name,
      sets: [{ weight: 0, reps: 0 }],
    }));
    setActiveExercises(initialExercises);
  };

  // Add set to an exercise
  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...activeExercises];
    // Copy the last set's values as default if available
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
    });
    setActiveExercises(updated);
  };

  // Remove set from an exercise
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeExercises];
    if (updated[exerciseIndex].sets.length <= 1) {
      Alert.alert('Предупреждение', 'У упражнения должен быть хотя бы один подход.');
      return;
    }
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setActiveExercises(updated);
  };

  // Update set weight/reps
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const updated = [...activeExercises];
    const num = Number(value.replace(',', '.'));
    updated[exerciseIndex].sets[setIndex][field] = isNaN(num) ? 0 : num;
    setActiveExercises(updated);
  };

  // Save the active workout session
  const handleSaveWorkout = async () => {
    if (!selectedSplit) return;

    // Filter exercises that have at least one set with non-zero reps/weight
    const validExercises = activeExercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.reps > 0),
    })).filter(ex => ex.sets.length > 0);

    if (validExercises.length === 0) {
      Alert.alert('Ошибка', 'Запишите хотя бы один выполненный подход (повторения должны быть больше 0).');
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      splitName: selectedSplit.name,
      exercises: validExercises,
    };

    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    await Storage.saveWorkoutSessions(updatedHistory);

    // Reset session state
    setSelectedSplit(null);
    setActiveExercises([]);
    setActiveTab('history');
    Alert.alert('Отлично!', 'Тренировка успешно сохранена.');
  };

  // Cancel active workout session
  const handleCancelWorkout = () => {
    Alert.alert('Отменить тренировку', 'Вы уверены, что хотите сбросить текущую тренировку?', [
      { text: 'Нет', style: 'cancel' },
      {
        text: 'Да, сбросить',
        style: 'destructive',
        onPress: () => {
          setSelectedSplit(null);
          setActiveExercises([]);
        },
      },
    ]);
  };

  // Delete workout session from history
  const handleDeleteHistory = async (id: string) => {
    Alert.alert('Удалить тренировку', 'Вы уверены, что хотите удалить эту тренировку из истории?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const updated = history.filter(s => s.id !== id);
          setHistory(updated);
          await Storage.saveWorkoutSessions(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: theme.backgroundElement }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'new' && [styles.tabActiveButton, { backgroundColor: '#6366F1' }],
          ]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' ? styles.tabActiveText : { color: theme.textSecondary }]}>
            Тренировка
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && [styles.tabActiveButton, { backgroundColor: '#6366F1' }],
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' ? styles.tabActiveText : { color: theme.textSecondary }]}>
            История ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'new' ? (
          // --- TAB 1: NEW WORKOUT ---
          !selectedSplit ? (
            // Select Split Screen
            <View style={styles.splitSelectionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text, textAlign: 'center', marginBottom: Spacing.three }]}>
                Какой сплит выберем сегодня?
              </Text>
              
              {splits.map(split => (
                <TouchableOpacity
                  key={split.id}
                  style={[styles.splitCard, { backgroundColor: theme.backgroundElement }]}
                  onPress={() => handleSelectSplit(split)}
                >
                  <View style={styles.splitCardLeft}>
                    <View style={[styles.dumbbellIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                      <Dumbbell color="#6366F1" size={20} />
                    </View>
                    <View>
                      <Text style={[styles.splitName, { color: theme.text }]}>{split.name}</Text>
                      <Text style={[styles.splitDesc, { color: theme.textSecondary }]}>
                        {split.exercises.length} упражнений
                      </Text>
                    </View>
                  </View>
                  <View style={styles.startBadge}>
                    <Text style={styles.startBadgeText}>Начать</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Active Workout Screen
            <View style={styles.activeWorkoutContainer}>
              <View style={[styles.activeHeaderCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.activeHeaderInfo}>
                  <Dumbbell color="#6366F1" size={24} />
                  <View>
                    <Text style={[styles.activeSplitName, { color: theme.text }]}>{selectedSplit.name}</Text>
                    <Text style={[styles.activeDate, { color: theme.textSecondary }]}>Сегодняшняя тренировка</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cancelLink} onPress={handleCancelWorkout}>
                  <Text style={styles.cancelLinkText}>Сбросить</Text>
                </TouchableOpacity>
              </View>

              {/* Exercises List */}
              {activeExercises.map((ex, exIdx) => (
                <View key={ex.exerciseName} style={[styles.exerciseCard, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[styles.exerciseCardTitle, { color: theme.text }]}>
                    {exIdx + 1}. {ex.exerciseName}
                  </Text>

                  {/* Header Row */}
                  <View style={styles.setRowHeader}>
                    <Text style={[styles.setHeaderLabel, { flex: 1, color: theme.textSecondary }]}>Подход</Text>
                    <Text style={[styles.setHeaderLabel, { width: 80, textAlign: 'center', color: theme.textSecondary }]}>Вес (кг)</Text>
                    <Text style={[styles.setHeaderLabel, { width: 80, textAlign: 'center', color: theme.textSecondary }]}>Повторы</Text>
                    <Text style={[styles.setHeaderLabel, { width: 40, color: theme.textSecondary }]}></Text>
                  </View>

                  {/* Sets Rows */}
                  {ex.sets.map((set, setIdx) => (
                    <View key={setIdx} style={styles.setRow}>
                      <Text style={[styles.setNumber, { color: theme.text }]}>{setIdx + 1}</Text>
                      
                      <TextInput
                        style={[styles.setInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="0"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        defaultValue={set.weight > 0 ? set.weight.toString() : ''}
                        onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'weight', val)}
                      />

                      <TextInput
                        style={[styles.setInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        placeholder="0"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="numeric"
                        defaultValue={set.reps > 0 ? set.reps.toString() : ''}
                        onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'reps', val)}
                      />

                      <TouchableOpacity
                        onPress={() => handleRemoveSet(exIdx, setIdx)}
                        style={styles.removeSetBtn}
                      >
                        <Trash2 color="#EF4444" size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.addSetBtn, { borderColor: theme.backgroundSelected }]}
                    onPress={() => handleAddSet(exIdx)}
                  >
                    <Plus color={theme.textSecondary} size={14} />
                    <Text style={[styles.addSetBtnText, { color: theme.textSecondary }]}>Добавить подход</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.saveWorkoutBtn} onPress={handleSaveWorkout}>
                <CheckCircle color="#ffffff" size={18} />
                <Text style={styles.saveWorkoutBtnText}>Завершить тренировку</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          // --- TAB 2: HISTORY ---
          <View style={styles.historyContainer}>
            {history.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
                <Calendar color={theme.textSecondary} size={32} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  История тренировок пуста. Проведите свою первую тренировку во вкладке «Тренировка»!
                </Text>
              </View>
            ) : (
              history.map(session => (
                <View key={session.id} style={[styles.historyCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitleRow}>
                      <Clock color="#6366F1" size={16} />
                      <Text style={[styles.historyDate, { color: theme.textSecondary }]}>{session.date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteHistory(session.id)}>
                      <Trash2 color="#EF4444" size={18} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.historySplitName, { color: theme.text }]}>{session.splitName}</Text>
                  
                  <View style={styles.historyDivider} />

                  {/* Logged Exercises */}
                  {session.exercises.map((ex, idx) => (
                    <View key={idx} style={styles.historyExerciseRow}>
                      <Text style={[styles.historyExerciseName, { color: theme.text }]}>{ex.exerciseName}</Text>
                      <View style={styles.historySetsRow}>
                        {ex.sets.map((set, sIdx) => (
                          <View key={sIdx} style={[styles.historySetBadge, { backgroundColor: theme.backgroundSelected }]}>
                            <Text style={[styles.historySetText, { color: theme.text }]}>
                              {set.weight}кг x {set.reps}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActiveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabActiveText: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  splitSelectionContainer: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  splitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: Spacing.three,
  },
  splitCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dumbbellIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  splitDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  startBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeWorkoutContainer: {
    gap: Spacing.three,
  },
  activeHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: Spacing.three,
  },
  activeHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activeSplitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeDate: {
    fontSize: 11,
  },
  cancelLink: {
    padding: Spacing.one,
  },
  cancelLinkText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  exerciseCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: Spacing.one,
  },
  setRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  setHeaderLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  setNumber: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: Spacing.one,
  },
  setInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  removeSetBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: Spacing.one,
  },
  addSetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveWorkoutBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: Spacing.two,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveWorkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    gap: Spacing.two,
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
  historyCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  historyDate: {
    fontSize: 12,
  },
  historySplitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDivider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.1)',
    marginVertical: Spacing.one,
  },
  historyExerciseRow: {
    marginBottom: Spacing.two,
  },
  historyExerciseName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  historySetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  historySetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historySetText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
