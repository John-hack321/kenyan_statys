import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  filterCountries,
  type Country,
} from '@/constants/countryCodes';

type Props = {
  value?: Country;
  onChange: (country: Country) => void;
};

export function CountryCodePicker({ value = DEFAULT_COUNTRY, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const data = useMemo(() => filterCountries(COUNTRIES, query), [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const select = (country: Country) => {
    onChange(country);
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.trigger}>
        <Text style={styles.triggerText}>
          {value.flag} {value.dialCode}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.flex}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Select country
              </Text>
              <Pressable onPress={close} hitSlop={12}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor="#888"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              style={styles.search}
            />

            <FlatList
              style={styles.list}
              data={data}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  No countries match "{query}"
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item)}
                  style={({ pressed }) => [
                    styles.row,
                    (pressed || item.code === value.code) && styles.rowSelected,
                  ]}>
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.dialCode}>{item.dialCode}</Text>
                </Pressable>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  triggerText: {
    fontSize: 16,
    color: '#000',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, lineHeight: 32, fontWeight: 'bold' },
  closeText: { color: '#007AFF', fontSize: 16 },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#000',
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  rowSelected: {
    backgroundColor: '#f0f0f0',
  },
  flag: { fontSize: 20 },
  name: { flex: 1, fontSize: 16, color: '#000' },
  dialCode: { fontSize: 14, color: '#888' },
  empty: { textAlign: 'center', padding: 16, color: '#888' },
});