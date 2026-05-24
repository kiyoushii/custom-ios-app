import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus as LucidePlus, Trash2 as LucideTrash2, ArrowUpRight as LucideArrowUpRight, ArrowDownRight as LucideArrowDownRight, Target as LucideTarget, Award as LucideAward, DollarSign as LucideDollarSign } from 'lucide-react-native';
const Plus = LucidePlus as any;
const Trash2 = LucideTrash2 as any;
const ArrowUpRight = LucideArrowUpRight as any;
const ArrowDownRight = LucideArrowDownRight as any;
const Target = LucideTarget as any;
const Award = LucideAward as any;
const DollarSign = LucideDollarSign as any;

import { Colors, Spacing } from '@/constants/theme';
import { Storage, Transaction, SavingGoal } from '@/utils/storage';

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  
  // Transaction Modal State
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txDesc, setTxDesc] = useState('');

  // Goal Modal State
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDesc, setGoalDesc] = useState('');

  // Add Funds Modal State (for goals)
  const [fundsModalVisible, setFundsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedTx = await Storage.getTransactions();
    const loadedGoals = await Storage.getGoals();
    setTransactions(loadedTx);
    setGoals(loadedGoals);
  };

  // Balance calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Add transaction
  const handleAddTransaction = async () => {
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    if (!txCategory.trim()) {
      Alert.alert('Ошибка', 'Укажите категорию');
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: txType,
      amount: Number(txAmount),
      category: txCategory.trim(),
      description: txDesc.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await Storage.saveTransactions(updated);

    // Reset form
    setTxAmount('');
    setTxCategory('');
    setTxDesc('');
    setTxModalVisible(false);
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    Alert.alert('Удалить транзакцию', 'Вы уверены, что хотите удалить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const updated = transactions.filter(t => t.id !== id);
          setTransactions(updated);
          await Storage.saveTransactions(updated);
        },
      },
    ]);
  };

  // Add savings goal
  const handleAddGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Ошибка', 'Введите название цели');
      return;
    }
    if (!goalTarget || isNaN(Number(goalTarget)) || Number(goalTarget) <= 0) {
      Alert.alert('Ошибка', 'Укажите корректную сумму цели');
      return;
    }

    const newGoal: SavingGoal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      targetAmount: Number(goalTarget),
      currentAmount: 0,
      description: goalDesc.trim(),
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    await Storage.saveGoals(updated);

    // Reset form
    setGoalName('');
    setGoalTarget('');
    setGoalDesc('');
    setGoalModalVisible(false);
  };

  // Add funds to selected goal
  const handleAddFunds = async () => {
    if (!selectedGoal || !fundsAmount || isNaN(Number(fundsAmount)) || Number(fundsAmount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    const amountToAdd = Number(fundsAmount);
    
    // Create an automatic expense transaction to reflect the transfer of money into savings
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: amountToAdd,
      category: 'Накопления',
      description: `Пополнение цели: ${selectedGoal.name}`,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    await Storage.saveTransactions(updatedTx);

    // Update goal amount
    const updatedGoals = goals.map(g => {
      if (g.id === selectedGoal.id) {
        return { ...g, currentAmount: g.currentAmount + amountToAdd };
      }
      return g;
    });

    setGoals(updatedGoals);
    await Storage.saveGoals(updatedGoals);

    // Reset
    setFundsAmount('');
    setFundsModalVisible(false);
    setSelectedGoal(null);
  };

  // Delete goal
  const handleDeleteGoal = async (id: string) => {
    Alert.alert('Удалить цель', 'Вы уверены, что хотите удалить эту финансовую цель?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          const updated = goals.filter(g => g.id !== id);
          setGoals(updated);
          await Storage.saveGoals(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CARD Balance */}
        <View style={[styles.balanceCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Текущий баланс</Text>
          <Text style={[styles.balanceValue, { color: theme.text }]}>
            {balance.toLocaleString('ru-RU')} ₽
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <ArrowUpRight color="#10B981" size={16} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Доходы</Text>
                <Text style={styles.statIncome}>+{totalIncome.toLocaleString('ru-RU')} ₽</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <ArrowDownRight color="#EF4444" size={16} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Расходы</Text>
                <Text style={styles.statExpense}>-{totalExpense.toLocaleString('ru-RU')} ₽</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#6366F1' }]}
            onPress={() => { setTxType('expense'); setTxModalVisible(true); }}
          >
            <Plus color="#ffffff" size={18} />
            <Text style={styles.actionBtnText}>Расход</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
            onPress={() => { setTxType('income'); setTxModalVisible(true); }}
          >
            <Plus color="#ffffff" size={18} />
            <Text style={styles.actionBtnText}>Доход</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]}
            onPress={() => setGoalModalVisible(true)}
          >
            <Target color="#ffffff" size={18} />
            <Text style={styles.actionBtnText}>Цель</Text>
          </TouchableOpacity>
        </View>

        {/* GOALS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Финансовые цели</Text>
        </View>

        {goals.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
            <Target color={theme.textSecondary} size={32} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Нет активных целей накопления</Text>
          </View>
        ) : (
          goals.map(item => {
            const pct = Math.min(Math.round((item.currentAmount / item.targetAmount) * 100), 100);
            const remaining = item.targetAmount - item.currentAmount;
            return (
              <View key={item.id} style={[styles.goalCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.goalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalName, { color: theme.text }]}>{item.name}</Text>
                    {item.description ? (
                      <Text style={[styles.goalDesc, { color: theme.textSecondary }]}>{item.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSelected }]}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: '#8B5CF6' }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: theme.text }]}>{pct}%</Text>
                </View>

                <View style={styles.goalFinancials}>
                  <Text style={[styles.goalFinText, { color: theme.textSecondary }]}>
                    Накоплено: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.currentAmount.toLocaleString('ru-RU')} ₽</Text>
                  </Text>
                  <Text style={[styles.goalFinText, { color: theme.textSecondary }]}>
                    Цель: <Text style={{ color: theme.text, fontWeight: '600' }}>{item.targetAmount.toLocaleString('ru-RU')} ₽</Text>
                  </Text>
                </View>

                <View style={styles.goalFooter}>
                  {remaining > 0 ? (
                    <Text style={styles.remainingText}>Осталось накопить: {remaining.toLocaleString('ru-RU')} ₽</Text>
                  ) : (
                    <View style={styles.completedBadge}>
                      <Award color="#10B981" size={14} />
                      <Text style={styles.completedBadgeText}>Цель достигнута!</Text>
                    </View>
                  )}
                  
                  {remaining > 0 && (
                    <TouchableOpacity
                      style={styles.addFundsBtn}
                      onPress={() => {
                        setSelectedGoal(item);
                        setFundsModalVisible(true);
                      }}
                    >
                      <Plus color="#ffffff" size={14} />
                      <Text style={styles.addFundsBtnText}>Отложить</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* TRANSACTIONS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>История операций</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.backgroundElement }]}>
            <DollarSign color={theme.textSecondary} size={32} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>История пуста</Text>
          </View>
        ) : (
          transactions.map(item => (
            <View key={item.id} style={[styles.txItem, { backgroundColor: theme.backgroundElement }]}>
              <View style={[
                styles.txIconCircle, 
                { backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
              ]}>
                {item.type === 'income' ? (
                  <ArrowUpRight color="#10B981" size={18} />
                ) : (
                  <ArrowDownRight color="#EF4444" size={18} />
                )}
              </View>

              <View style={styles.txInfo}>
                <Text style={[styles.txCategory, { color: theme.text }]}>{item.category}</Text>
                {item.description ? (
                  <Text style={[styles.txDesc, { color: theme.textSecondary }]} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <Text style={[styles.txDate, { color: theme.textSecondary }]}>{item.date}</Text>
              </View>

              <View style={styles.txRight}>
                <Text style={[
                  styles.txAmount,
                  { color: item.type === 'income' ? '#10B981' : '#EF4444' }
                ]}>
                  {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('ru-RU')} ₽
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTransaction(item.id)} style={styles.txDeleteBtn}>
                  <Trash2 color="#B0B4BA" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>

      {/* MODAL: ADD TRANSACTION */}
      <Modal visible={txModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Добавить {txType === 'income' ? 'Доход' : 'Расход'}
            </Text>

            <TextInput
              placeholder="Сумма (₽)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              keyboardType="numeric"
              value={txAmount}
              onChangeText={setTxAmount}
            />

            <TextInput
              placeholder="Категория (например: Продукты, Зарплата)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={txCategory}
              onChangeText={setTxCategory}
            />

            <TextInput
              placeholder="Комментарий (необязательно)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={txDesc}
              onChangeText={setTxDesc}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                onPress={() => setTxModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: txType === 'income' ? '#10B981' : '#EF4444' }]}
                onPress={handleAddTransaction}
              >
                <Text style={styles.confirmBtnText}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD GOAL */}
      <Modal visible={goalModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Новая цель накопления</Text>

            <TextInput
              placeholder="Название цели (например: iPhone)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={goalName}
              onChangeText={setGoalName}
            />

            <TextInput
              placeholder="Целевая сумма (₽)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              keyboardType="numeric"
              value={goalTarget}
              onChangeText={setGoalTarget}
            />

            <TextInput
              placeholder="Описание (необязательно)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={goalDesc}
              onChangeText={setGoalDesc}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={handleAddGoal}
              >
                <Text style={styles.confirmBtnText}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD FUNDS TO GOAL */}
      <Modal visible={fundsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Отложить в: {selectedGoal?.name}
            </Text>
            <Text style={[styles.modalSubTitle, { color: theme.textSecondary }]}>
              Сумма будет списана с баланса в категорию «Накопления»
            </Text>

            <TextInput
              placeholder="Сумма пополнения (₽)"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              keyboardType="numeric"
              value={fundsAmount}
              onChangeText={setFundsAmount}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.backgroundSelected }]}
                onPress={() => {
                  setFundsModalVisible(false);
                  setSelectedGoal(null);
                  setFundsAmount('');
                }}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={handleAddFunds}
              >
                <Text style={styles.confirmBtnText}>Отложить</Text>
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
  balanceCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    paddingTop: Spacing.three,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
  },
  statIncome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statExpense: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  goalCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  goalFinancials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalFinText: {
    fontSize: 12,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  remainingText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  addFundsBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addFundsBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  txIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: 15,
    fontWeight: '600',
  },
  txDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  txDate: {
    fontSize: 10,
    marginTop: 4,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  txDeleteBtn: {
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
  modalSubTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: -Spacing.two,
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
